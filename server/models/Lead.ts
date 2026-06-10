import mongoose from 'mongoose';

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

export const Lead = mongoose.model('Lead', leadSchema);
