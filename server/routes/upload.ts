import express from 'express';
import * as uploadController from '../controllers/uploadController';

const router = express.Router();

router.post('/', uploadController.handleUpload);

export default router;
