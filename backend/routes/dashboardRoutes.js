import express from 'express';
import { getStats, getCharts } from '../controllers/dashboardController.js';
import { allowServiceOrRole } from '../middlewares/auth.js';

const router = express.Router();

router.get('/stats', allowServiceOrRole('officer', 'admin'), getStats);
router.get('/charts', allowServiceOrRole('officer', 'admin'), getCharts);

export default router;
