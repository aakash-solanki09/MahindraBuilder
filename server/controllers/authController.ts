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
      user: { id: user._id, email: user.email, role: user.role, name: user.name } 
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
