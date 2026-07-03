import express from 'express';
import {
  getUsers,
  updateUserStatus,
  deleteUser,
  getOfficers,
  createOfficer,
  approveOfficer,
  updateOfficer,
  deleteOfficer,
  getAnalytics,
  getActivityLogs,
  getSettings,
  updateSettings,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/users', getUsers);
router.put('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);

router.get('/officers', getOfficers);
router.post('/officers', createOfficer);
router.put('/officers/:id/approve', approveOfficer);
router.put('/officers/:id', updateOfficer);
router.delete('/officers/:id', deleteOfficer);

router.get('/analytics', getAnalytics);
router.get('/logs', getActivityLogs);

router.get('/settings', getSettings);
router.put('/settings', updateSettings);

export default router;
