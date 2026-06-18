import mongoose from 'mongoose';

const sectionSchema = new mongoose.Schema({
  id: String,
  type: { type: String, required: true },
  order: Number,
  content: { type: mongoose.Schema.Types.Mixed, default: {} },
  styles: { type: mongoose.Schema.Types.Mixed, default: {} }
});

const pageSchema = new mongoose.Schema({
  pageName: { type: String, default: 'Mahindra Logistics' },
  slug: { type: String, default: 'preview', unique: true },
  published: { type: Boolean, default: false },
  publishedAt: Date,
  publishedSnapshot: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  meta: {
    title: { type: String, default: 'Mahindra Logistics' },
    description: { type: String, default: '3PL Logistics & Warehousing Solutions' },
    gaMeasurementId: { type: String, default: '' },
    gtmId: { type: String, default: '' },
    pixelId: { type: String, default: '' },
    floatingCta: {
      text: { type: String, default: 'Get Free Quote' },
      backgroundColor: { type: String, default: '#E31837' },
      textColor: { type: String, default: '#ffffff' },
      borderColor: { type: String, default: '' }
    },
    attributes: [{
      name: { type: String },
      property: { type: String },
      httpEquiv: { type: String },
      content: { type: String }
    }],
    links: [{ rel: { type: String }, href: { type: String } }]
  },
  sections: [sectionSchema]
}, { timestamps: true });

export const Page = mongoose.model('Page', pageSchema);
