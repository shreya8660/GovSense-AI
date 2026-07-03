import express from 'express';
import { analyzeText } from '../controllers/aiController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.post('/analyze', protect, authorize('officer', 'admin'), analyzeText);

export default router;
