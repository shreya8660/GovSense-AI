import express from 'express';
import {
  getPolicies,
  getPolicyById,
  createPolicy,
  updatePolicy,
  deletePolicy,
} from '../controllers/policyController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', getPolicies);
router.get('/:id', getPolicyById);
router.post('/', protect, authorize('admin'), createPolicy);
router.put('/:id', protect, authorize('admin'), updatePolicy);
router.delete('/:id', protect, authorize('admin'), deletePolicy);

export default router;
