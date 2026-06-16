import mongoose from 'mongoose';

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

export const UTM = mongoose.model('UTM', utmSchema);
