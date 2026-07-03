import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middlewares/errorMiddleware.js';

import authRoutes from './routes/authRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import policyRoutes from './routes/policyRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ---- Connect to MongoDB ----
connectDB();

// ---- Core Middlewares ----
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://gov-sense-ai.vercel.app/"
  ],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ---- Static file serving (uploaded attachments) ----
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ---- Health check ----
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'GovSense AI API is running',
    timestamp: new Date().toISOString(),
  });
});

// ---- Route mounts ----
app.use('/api/auth', authRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/policies', policyRoutes);

// ---- 404 + global error handler ----
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 GovSense AI server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});

export default app;
