import express from 'express';
import * as customSectionController from '../controllers/customSectionController';

import { authenticate } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticate as any, customSectionController.getAllTemplates);
router.post('/', authenticate as any, customSectionController.createTemplate);
router.put('/:id', authenticate as any, customSectionController.updateTemplate);
router.delete('/:id', authenticate as any, customSectionController.deleteTemplate);

export default router;
