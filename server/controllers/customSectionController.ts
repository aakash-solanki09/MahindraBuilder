import { Request, Response } from 'express';
import { CustomSection } from '../models/CustomSection';

export const getAllTemplates = async (req: Request, res: Response) => {
  try {
    const templates = await CustomSection.find().sort({ createdAt: -1 });
    res.json(templates);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const createTemplate = async (req: Request, res: Response) => {
  try {
    const { name, content, styles, type } = req.body;
    const template = new CustomSection({ 
      name, 
      content, 
      styles, 
      type: type || 'custom' 
    });
    const saved = await template.save();
    res.status(201).json(saved);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const updateTemplate = async (req: Request, res: Response) => {
  try {
    const { name, content, styles, type } = req.body;
    const updated = await CustomSection.findByIdAndUpdate(
      req.params.id,
      { name, content, styles, type: type || 'custom' },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Template not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteTemplate = async (req: Request, res: Response) => {
  try {
    await CustomSection.findByIdAndDelete(req.params.id);
    res.json({ message: 'Template deleted' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
