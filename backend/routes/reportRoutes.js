import express from 'express';
import { downloadPdfReport, downloadExcelReport } from '../controllers/reportController.js';
import { allowServiceOrRole } from '../middlewares/auth.js';

const router = express.Router();

router.get('/pdf', allowServiceOrRole('officer', 'admin'), downloadPdfReport);
router.get('/excel', allowServiceOrRole('officer', 'admin'), downloadExcelReport);

export default router;
