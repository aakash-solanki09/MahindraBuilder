import express from 'express';
import * as leadController from '../controllers/leadController';

import { authenticate } from '../middleware/auth';

const router = express.Router();

router.post('/', leadController.createLead);
router.get('/', authenticate as any, leadController.getAllLeads);

export default router;
