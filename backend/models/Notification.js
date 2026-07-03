import mongoose from 'mongoose';
import { NOTIFICATION_TYPES } from '../utils/constants.js';

const notificationSchema = new mongoose.Schema(
  {
    // Polymorphic reference - recipient can be a Citizen, Officer, or Admin
    recipient: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'recipientModel' },
    recipientModel: { type: String, required: true, enum: ['User', 'Officer', 'Admin'] },

    type: { type: String, required: true, enum: NOTIFICATION_TYPES },
    title: { type: String, required: true, trim: true, maxlength: 150 },
    message: { type: String, required: true, maxlength: 1000 },

    relatedFeedback: { type: mongoose.Schema.Types.ObjectId, ref: 'Feedback', default: null },
    link: { type: String, default: '' }, // frontend route to deep-link to, e.g. /officer/feedback/:id

    isRead: { type: Boolean, default: false },
    readAt: { type: Date, default: null },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
