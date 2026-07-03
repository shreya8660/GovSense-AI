import mongoose from 'mongoose';
import { REPORT_TYPES, REPORT_FORMATS } from '../utils/constants.js';

const reportSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    type: { type: String, enum: REPORT_TYPES, required: true },
    format: { type: String, enum: REPORT_FORMATS, required: true },

    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
    dateRange: {
      start: { type: Date, required: true },
      end: { type: Date, required: true },
    },

    // Snapshot of the stats used to build the report, so it can be re-rendered
    // without recomputing against live (possibly changed) feedback data
    stats: { type: mongoose.Schema.Types.Mixed, default: {} },

    fileUrl: { type: String, default: null },

    // "System" covers reports generated automatically by n8n / cron rather than a human
    generatedBy: { type: mongoose.Schema.Types.ObjectId, refPath: 'generatedByModel', default: null },
    generatedByModel: { type: String, enum: ['Officer', 'Admin', 'System'], default: 'System' },

    status: { type: String, enum: ['generating', 'completed', 'failed'], default: 'generating' },
    errorMessage: { type: String, default: null },
  },
  { timestamps: true }
);

reportSchema.index({ type: 1, createdAt: -1 });
reportSchema.index({ department: 1 });

export default mongoose.model('Report', reportSchema);
