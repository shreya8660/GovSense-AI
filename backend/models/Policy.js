import mongoose from 'mongoose';
import { POLICY_STATUS } from '../utils/constants.js';

const policySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, maxlength: 8000 },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    status: { type: String, enum: POLICY_STATUS, default: 'draft' },
    documentUrl: { type: String, default: '' }, // link to uploaded policy PDF
    tags: [{ type: String, trim: true }],
    consultationStartDate: Date,
    consultationEndDate: Date,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },

    // Denormalized counters, kept in sync by the feedback controller
    viewCount: { type: Number, default: 0 },
    feedbackCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

policySchema.index({ title: 'text', description: 'text' });
policySchema.index({ department: 1, status: 1 });
policySchema.index({ consultationEndDate: 1 });

export default mongoose.model('Policy', policySchema);
