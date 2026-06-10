import express from 'express';
import * as pageController from '../controllers/pageController';

const router = express.Router();

router.get('/slug/:slug', pageController.getPageBySlug);
router.get('/published', pageController.getPublishedPage);
router.get('/', pageController.getAllPages);
router.get('/:id', pageController.getPageById);
router.post('/', pageController.createOrUpdatePage);
router.delete('/:id', pageController.deletePage);

export default router;
