import { Request, Response } from 'express';
import { UTM } from '../models/UTM';

export const captureUTM = async (req: Request, res: Response) => {
  try {
    const utmData = {
      pageId: req.body.pageId || undefined,
      pageName: req.body.pageName || '',
      pageSlug: req.body.pageSlug || '',
      sourcePath: req.body.sourcePath || '',
      utm_source: req.body.utm_source || '',
      utm_medium: req.body.utm_medium || '',
      utm_campaign: req.body.utm_campaign || '',
      utm_id: req.body.utm_id || '',
      utm_term: req.body.utm_term || '',
      utm_content: req.body.utm_content || '',
      fullUrl: req.body.fullUrl || '',
      referrer: req.headers.referer || '',
      userAgent: req.headers['user-agent'] || '',
      ip: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '',
    };

    const utm = new UTM(utmData);
    await utm.save();

    res.status(201).json({ message: 'UTM captured', id: utm._id });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllUTMs = async (req: Request, res: Response) => {
  try {
    const utms = await UTM.find().sort({ createdAt: -1 });
    res.json(utms);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getUTMsByPage = async (req: Request, res: Response) => {
  try {
    const { pageSlug } = req.params;
    const utms = await UTM.find({ pageSlug }).sort({ createdAt: -1 });
    res.json(utms);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
