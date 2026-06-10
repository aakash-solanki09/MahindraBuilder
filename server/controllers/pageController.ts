import { Request, Response } from 'express';
import { Page } from '../models/Page';

const buildPublishedSnapshot = (payload: any) => ({
  pageName: payload.pageName,
  slug: payload.slug,
  meta: payload.meta,
  sections: payload.sections
});

const buildPersistedPayload = (payload: any, existing?: any) => {
  const isPublishRequest = payload.published === true;
  const persisted: any = { ...payload };

  if (isPublishRequest) {
    persisted.published = true;
    persisted.publishedAt = payload.publishedAt || new Date();
    persisted.publishedSnapshot = buildPublishedSnapshot(payload);
    return persisted;
  }

  if (existing?.published) {
    // Keep the currently published page live while saving draft edits.
    persisted.published = true;
    persisted.publishedAt = existing.publishedAt;
    persisted.publishedSnapshot = existing.publishedSnapshot;
    return persisted;
  }

  persisted.published = false;
  return persisted;
};

export const getPageBySlug = async (req: Request, res: Response) => {
  try {
    const page = await Page.findOne({ slug: req.params.slug });
    if (!page) return res.status(404).json({ message: 'Page not found' });
    res.json(page);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getPublishedPage = async (req: Request, res: Response) => {
  try {
    const { slug } = req.query;
    const query: any = { published: true };
    if (slug) query.slug = slug;
    
    const page = await Page.findOne(query).lean();
    if (!page) return res.status(404).json({ message: 'No published page found' });

    if (page.publishedSnapshot) {
      return res.json({
        ...page,
        ...page.publishedSnapshot,
        published: true
      });
    }

    res.json(page);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllPages = async (req: Request, res: Response) => {
  try {
    const pages = await Page.find().sort({ updatedAt: -1 });
    res.json(pages);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getPageById = async (req: Request, res: Response) => {
  try {
    const page = await Page.findById(req.params.id);
    if (!page) return res.status(404).json({ message: 'Page not found' });
    res.json(page);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const createOrUpdatePage = async (req: Request, res: Response) => {
  try {
    const { id, meta, ...data } = req.body;
    const targetId = id || data._id;
    const incomingPayload = { ...data, meta };

    // 1. Try updating by ID
    if (targetId) {
      const existingById = await Page.findById(targetId);
      if (!existingById) {
        return res.status(404).json({ message: 'Page not found for update' });
      }

      if (data.slug) {
        const slugTakenByAnother = await Page.findOne({
          slug: data.slug,
          _id: { $ne: targetId }
        });

        if (slugTakenByAnother) {
          return res.status(409).json({ message: 'Slug already in use by another page' });
        }
      }

      const payloadById = buildPersistedPayload(incomingPayload, existingById);
      const page = await Page.findByIdAndUpdate(targetId, payloadById, { new: true });
      if (page) return res.json(page);
    }

    // 2. For no-ID save, only allow slug-update fallback for the home preview page.
    if (data.slug) {
      const existing = await Page.findOne({ slug: data.slug });
      if (existing) {
        if (data.slug === 'preview') {
          const payloadBySlug = buildPersistedPayload(incomingPayload, existing);
          const updated = await Page.findOneAndUpdate({ slug: data.slug }, payloadBySlug, { new: true });
          return res.json(updated);
        }

        return res.status(409).json({ message: 'Slug already in use' });
      }
    }

    // 3. Create new
    const payloadForCreate = buildPersistedPayload(incomingPayload);
    const page = new Page(payloadForCreate);
    await page.save();
    res.status(201).json(page);
  } catch (err: any) {
    console.error('Save Page Error:', err);
    res.status(500).json({ message: err.message });
  }
};

export const deletePage = async (req: Request, res: Response) => {
  try {
    const page = await Page.findByIdAndDelete(req.params.id);
    if (!page) return res.status(404).json({ message: 'Page not found' });
    res.json({ message: 'Page deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
