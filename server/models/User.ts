import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'client'], default: 'client' },
  name: { type: String },
  brandName: { type: String, default: 'Mahindra Logistics' },
  brandLogo: { type: String, default: '/assets/images/86.png' }
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
