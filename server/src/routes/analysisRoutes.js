import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { analysisRateLimiter } from '../middleware/rateLimiter.js';
import { validateBody } from '../validators/authValidator.js';
import {
  createAnalysisSchema,
  queryAnalysesSchema,
  validateQuery,
} from '../validators/analysisValidator.js';
import * as analysisController from '../controllers/analysisController.js';

const router = Router();

// All analyses routes require authentication
router.use(requireAuth);

router.post(
  '/',
  analysisRateLimiter,
  validateBody(createAnalysisSchema),
  analysisController.create
);

router.get(
  '/',
  validateQuery(queryAnalysesSchema),
  analysisController.list
);

router.get('/:id', analysisController.getById);

router.delete('/:id', analysisController.deleteById);

export default router;
