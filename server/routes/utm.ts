import express from 'express';
import * as utmController from '../controllers/utmController';

import { authenticate } from '../middleware/auth';

const router = express.Router();

router.post('/', utmController.captureUTM);
router.get('/', authenticate as any, utmController.getAllUTMs);
router.get('/page/:pageSlug', authenticate as any, utmController.getUTMsByPage);

export default router;
