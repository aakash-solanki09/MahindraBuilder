import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET || 'secret', 
      { expiresIn: '1d' }
    );
    
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        email: user.email, 
        role: user.role, 
        name: user.name,
        brandName: user.brandName,
        brandLogo: user.brandLogo
      } 
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, role, name } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, role, name });
    await user.save();
    res.status(201).json({ message: 'User created' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const updateProfile = async (req: any, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { email, name, currentPassword, newPassword, brandName, brandLogo } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if new email is already in use by another user
    if (email && email.toLowerCase() !== user.email.toLowerCase()) {
      const emailExists = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
      if (emailExists && String(emailExists._id) !== String(user._id)) {
        return res.status(400).json({ message: 'Email/Username is already in use' });
      }
      user.email = email;
    }

    if (name !== undefined) {
      user.name = name;
    }

    if (brandName !== undefined) {
      user.brandName = brandName;
    }

    if (brandLogo !== undefined) {
      user.brandLogo = brandLogo;
    }

    // If password change is requested
    if (currentPassword || newPassword) {
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Both current password and new password are required' });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Incorrect current password' });
      }

      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET || 'secret', 
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Profile updated successfully',
      token,
      user: { 
        id: user._id, 
        email: user.email, 
        role: user.role, 
        name: user.name,
        brandName: user.brandName,
        brandLogo: user.brandLogo
      }
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

