import express from 'express';
import {
  createFeedback,
  getFeedback,
  getMyFeedback,
  getFeedbackById,
  updateFeedback,
  deleteFeedback,
  approveFeedback,
} from '../controllers/feedbackController.js';
import { protect, authorize } from '../middlewares/auth.js';
import upload from '../middlewares/upload.js';

const router = express.Router();

router.post('/', protect, authorize('citizen'), upload.single('attachment'), createFeedback);
router.get('/', protect, authorize('officer', 'admin'), getFeedback);
router.get('/my', protect, authorize('citizen'), getMyFeedback);
router.get('/:id', protect, getFeedbackById);
router.put('/:id', protect, updateFeedback);
router.delete('/:id', protect, deleteFeedback);
router.put('/:id/approve', protect, authorize('officer', 'admin'), approveFeedback);

export default router;
