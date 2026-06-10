import express from 'express';
import path from 'path';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import dns from 'dns';

// Prefer IPv4 first to avoid IPv6 connection timeout issues on macOS
dns.setDefaultResultOrder('ipv4first');

import authRoutes from './routes/auth';
import pageRoutes from './routes/page';
import leadRoutes from './routes/lead';
import otpRoutes from './routes/otp';
import customSectionRoutes from './routes/customSections';
import uploadRoutes from './routes/upload';
import { User } from './models/User';
import bcrypt from 'bcryptjs';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5001;

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:7001';

app.use(cors({
  origin: [CLIENT_URL, 'http://localhost:7001'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(path.join(process.cwd(), 'public/uploads')));

// Root Route for Health Check
app.get('/', (req, res) => {
  res.json({ message: 'Mahindra Builder API is running successfully!', status: 'online' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/pages', pageRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/custom-sections', customSectionRoutes);
app.use('/api/upload', uploadRoutes);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global Error Handler:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mahindra-builder')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Create default admin if not exists
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        email: 'admin@mahindra.com',
        password: hashedPassword,
        role: 'admin',
        name: 'Admin User'
      });
      console.log('Default admin user created: admin@mahindra.com / admin123');
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.error('MongoDB connection error:', err));
