import express from 'express';
import * as customSectionController from '../controllers/customSectionController';

const router = express.Router();

router.get('/', customSectionController.getAllTemplates);
router.post('/', customSectionController.createTemplate);
router.put('/:id', customSectionController.updateTemplate);
router.delete('/:id', customSectionController.deleteTemplate);

export default router;
