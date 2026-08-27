import express from 'express';
import * as pageController from '../controllers/pageController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Public routes for rendering live pages
router.get('/slug/:slug', pageController.getPageBySlug);
router.get('/published', pageController.getPublishedPage);

// Protected admin routes
router.get('/', authenticate as any, pageController.getAllPages);
router.get('/:id', authenticate as any, pageController.getPageById);
router.post('/', authenticate as any, pageController.createOrUpdatePage);
router.delete('/:id', authenticate as any, pageController.deletePage);

export default router;
