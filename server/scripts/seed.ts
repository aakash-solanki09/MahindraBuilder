const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mahindra-builder';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'client'], default: 'client' },
  name: String,
}, { timestamps: true });

const utmSchema = new mongoose.Schema({
  pageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Page' },
  pageName: String,
  pageSlug: String,
  sourcePath: String,
  utm_source: { type: String, default: '' },
  utm_medium: { type: String, default: '' },
  utm_campaign: { type: String, default: '' },
  utm_id: { type: String, default: '' },
  utm_term: { type: String, default: '' },
  utm_content: { type: String, default: '' },
  fullUrl: String,
  referrer: String,
  userAgent: String,
  ip: String,
}, { timestamps: true });

const leadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  origin: String,
  destination: String,
  serviceType: String,
  message: String,
  pageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Page' },
  sourcePageName: String,
  sourcePageSlug: String,
  sourcePath: String,
}, { timestamps: true, strict: false });

const pageSchema = new mongoose.Schema({
  pageName: { type: String, default: 'Mahindra Logistics' },
  slug: { type: String, unique: true, default: 'preview' },
  published: { type: Boolean, default: false },
  publishedAt: Date,
  publishedSnapshot: { type: mongoose.Schema.Types.Mixed, default: null },
  meta: {
    title: { type: String, default: 'Mahindra Logistics' },
    description: String,
    gaMeasurementId: String,
    floatingCta: {
      text: String,
      backgroundColor: String,
      textColor: String,
      borderColor: String,
    },
    attributes: [{ name: String, property: String, httpEquiv: String, content: String }],
    links: [{ rel: String, href: String }],
  },
  sections: [{
    id: String,
    type: { type: String, required: true },
    order: Number,
    content: mongoose.Schema.Types.Mixed,
    styles: mongoose.Schema.Types.Mixed,
  }],
}, { timestamps: true });

const otpSchema = new mongoose.Schema({
  mobile: { type: String, required: true },
  otp: { type: String, required: true },
  verified: { type: Boolean, default: false },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const User = mongoose.model('User', userSchema);
const UTM = mongoose.model('UTM', utmSchema);
const Lead = mongoose.model('Lead', leadSchema);
const Page = mongoose.model('Page', pageSchema);
const Otp = mongoose.model('Otp', otpSchema);

const migrations = [
  {
    name: '001-ensure-admin-user',
    up: async () => {
      const adminExists = await User.findOne({ role: 'admin' });
      if (!adminExists) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await User.create({
          email: 'admin@mahindra.com',
          password: hashedPassword,
          role: 'admin',
          name: 'Admin User',
        });
        console.log('  [migration] Default admin created: admin@mahindra.com / admin123');
      } else {
        console.log('  [migration] Admin user already exists, skipping');
      }
    },
  },
  {
    name: '002-ensure-utm-indexes',
    up: async () => {
      const indexes = await UTM.collection.indexes();
      const hasPageSlug = indexes.some((i) => i.key && i.key.pageSlug === 1);
      if (!hasPageSlug) {
        await UTM.collection.createIndex({ pageSlug: 1 });
        console.log('  [migration] Created UTM pageSlug index');
      } else {
        console.log('  [migration] UTM indexes already exist, skipping');
      }
    },
  },
  {
    name: '003-ensure-lead-indexes',
    up: async () => {
      const indexes = await Lead.collection.indexes();
      const hasPageId = indexes.some((i) => i.key && i.key.pageId === 1);
      if (!hasPageId) {
        await Lead.collection.createIndex({ pageId: 1 });
        await Lead.collection.createIndex({ createdAt: -1 });
        console.log('  [migration] Created Lead indexes');
      } else {
        console.log('  [migration] Lead indexes already exist, skipping');
      }
    },
  },
  {
    name: '004-ensure-otp-ttl-index',
    up: async () => {
      const indexes = await Otp.collection.indexes();
      const hasTtl = indexes.some((i) => i.key && i.key.expiresAt === 1 && i.expireAfterSeconds === 0);
      if (!hasTtl) {
        await Otp.collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
        console.log('  [migration] Created OTP TTL index');
      } else {
        console.log('  [migration] OTP TTL index already exists, skipping');
      }
    },
  },
  {
    name: '005-ensure-page-indexes',
    up: async () => {
      const indexes = await Page.collection.indexes();
      const hasSlug = indexes.some((i) => i.key && i.key.slug === 1);
      if (!hasSlug) {
        await Page.collection.createIndex({ slug: 1 }, { unique: true });
        console.log('  [migration] Created Page slug unique index');
      } else {
        console.log('  [migration] Page indexes already exist, skipping');
      }
    },
  },
];

async function runMigrations() {
  console.log('[seed] Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('[seed] Connected. Running migrations...\n');

  for (const migration of migrations) {
    console.log(`[seed] Running: ${migration.name}`);
    try {
      await migration.up();
      console.log(`[seed] ✓ ${migration.name} done\n`);
    } catch (err) {
      console.error(`[seed] ✗ ${migration.name} failed:`, err.message);
    }
  }

  console.log('[seed] All migrations completed.');
  await mongoose.disconnect();
  process.exit(0);
}

runMigrations().catch((err) => {
  console.error('[seed] Fatal error:', err);
  process.exit(1);
});
