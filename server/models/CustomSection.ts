import mongoose from 'mongoose';

const CustomSectionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, default: 'custom' },
  content: { type: mongoose.Schema.Types.Mixed, required: true },
  styles: { type: mongoose.Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const CustomSection = mongoose.model('CustomSection', CustomSectionSchema);
