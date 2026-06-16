import express from 'express';
import * as utmController from '../controllers/utmController';

const router = express.Router();

router.post('/', utmController.captureUTM);
router.get('/', utmController.getAllUTMs);
router.get('/page/:pageSlug', utmController.getUTMsByPage);

export default router;
