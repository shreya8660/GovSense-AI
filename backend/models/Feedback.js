import mongoose from 'mongoose';
import {
  SENTIMENT_LABELS,
  EMOTIONS,
  FEEDBACK_STATUS,
  AI_PROVIDERS,
  LANGUAGES,
} from '../utils/constants.js';

const feedbackSchema = new mongoose.Schema(
  {
    citizen: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Feedback can be tied to a formal Policy record, and/or reference it by
    // free-text name (citizens may type a policy name that isn't yet formally listed)
    policy: { type: mongoose.Schema.Types.ObjectId, ref: 'Policy', default: null },
    policyName: { type: String, required: [true, 'Policy name is required'], trim: true, maxlength: 200 },

    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },

    title: { type: String, required: [true, 'Feedback title is required'], trim: true, maxlength: 150 },
    description: {
      type: String,
      required: [true, 'Feedback description is required'],
      maxlength: 5000,
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    location: { type: String, trim: true, maxlength: 150 },

    attachment: {
      url: { type: String, default: null },
      fileName: { type: String, default: null },
      fileType: { type: String, default: null },
      fileSize: { type: Number, default: null }, // bytes
    },

    inputMode: { type: String, enum: ['text', 'voice'], default: 'text' },
    language: { type: String, enum: LANGUAGES, default: 'en' },

    // ---- AI analysis results (populated by POST /api/ai/analyze right after creation) ----
    ai: {
      sentiment: {
        label: { type: String, enum: SENTIMENT_LABELS, default: null },
        confidenceScore: { type: Number, min: 0, max: 1, default: null },
      },
      emotion: { type: String, enum: EMOTIONS, default: null },
      keywords: [{ type: String, trim: true }],
      summary: { type: String, trim: true, maxlength: 1000 },
      provider: { type: String, enum: AI_PROVIDERS, default: null },
      processedAt: { type: Date, default: null },
      // Full raw model response kept for debugging/audit, excluded by default
      rawResponse: { type: mongoose.Schema.Types.Mixed, select: false },
    },

    status: { type: String, enum: FEEDBACK_STATUS, default: 'pending' },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Officer', default: null },
    approvedAt: { type: Date, default: null },
    isPublic: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ---- Indexes for dashboard queries & search ----
feedbackSchema.index({ title: 'text', description: 'text' });
feedbackSchema.index({ department: 1, 'ai.sentiment.label': 1 });
feedbackSchema.index({ category: 1 });
feedbackSchema.index({ citizen: 1 });
feedbackSchema.index({ status: 1 });
feedbackSchema.index({ createdAt: -1 });

// Convenience virtual: has this feedback finished AI processing?
feedbackSchema.virtual('isAnalyzed').get(function () {
  return Boolean(this.ai?.sentiment?.label);
});

feedbackSchema.set('toJSON', { virtuals: true });
feedbackSchema.set('toObject', { virtuals: true });

export default mongoose.model('Feedback', feedbackSchema);
