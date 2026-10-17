import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { uploadSingleResume } from '../middleware/upload.js';
import * as resumeController from '../controllers/resumeController.js';

const router = Router();

router.post('/parse', requireAuth, uploadSingleResume, resumeController.parseResume);

export default router;
