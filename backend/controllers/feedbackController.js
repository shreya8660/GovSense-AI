import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess, ApiError } from '../utils/apiResponse.js';
import Feedback from '../models/Feedback.js';
import Policy from '../models/Policy.js';
import Officer from '../models/Officer.js';
import Notification from '../models/Notification.js';
import { analyzeFeedback } from '../services/AI/aiService.js';
import { sendEmail, feedbackSubmittedTemplate } from '../services/Email/emailService.js';

// Best-effort ping to an n8n webhook so external workflows (email digests,
// Slack alerts, Google Sheets logging, etc.) can react to new submissions.
// Never blocks or fails the main request.
const notifyN8n = (payload) => {
  if (!process.env.N8N_WEBHOOK_URL) return;
  fetch(process.env.N8N_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch((err) => console.error('n8n webhook notify failed:', err.message));
};

// @desc    Submit new citizen feedback - triggers AI analysis synchronously
//          so the response already contains sentiment/emotion/keywords/summary
// @route   POST /api/feedback
// @access  Private (Citizen)
export const createFeedback = asyncHandler(async (req, res) => {
  const {
    policyName,
    policy,
    department,
    category,
    title,
    description,
    rating,
    location,
    inputMode,
    language,
  } = req.body;

  if (!policyName || !department || !category || !title || !description || !rating) {
    throw new ApiError(400, 'policyName, department, category, title, description, and rating are required');
  }

  const attachment = req.file
    ? {
        url: `/uploads/${req.file.filename}`,
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
      }
    : undefined;

  const feedback = await Feedback.create({
    citizen: req.user.id,
    policy: policy || undefined,
    policyName,
    department,
    category,
    title,
    description,
    rating,
    location,
    attachment,
    inputMode: inputMode || 'text',
    language: language || 'en',
  });

  // ---- AI analysis (Positive/Negative/Neutral, emotion, keywords, summary) ----
  const analysis = await analyzeFeedback({ title, description });
  feedback.ai = { ...analysis, processedAt: new Date() };
  await feedback.save();

  // Keep the policy's feedback counter in sync, if this feedback references one
  if (policy) {
    Policy.findByIdAndUpdate(policy, { $inc: { feedbackCount: 1 } }).catch(() => {});
  }

  // Confirmation email to the citizen (best-effort)
  sendEmail({
    to: req.user.doc.email,
    subject: 'GovSense AI - Feedback Received',
    html: feedbackSubmittedTemplate(req.user.doc.name, feedback.title, feedback.ai.sentiment.label),
  }).catch((err) => console.error('Email send failed:', err.message));

  // In-app notification for every active, approved officer in the relevant department
  Officer.find({ department, isApproved: true, isActive: true })
    .select('_id')
    .then((officers) => {
      if (!officers.length) return;
      return Notification.insertMany(
        officers.map((o) => ({
          recipient: o._id,
          recipientModel: 'Officer',
          type: 'feedback_submitted',
          title: 'New feedback submitted',
          message: `New ${feedback.ai.sentiment.label} feedback: "${feedback.title}"`,
          relatedFeedback: feedback._id,
          link: `/officer/feedback/${feedback._id}`,
        }))
      );
    })
    .catch((err) => console.error('Officer notification failed:', err.message));

  // Notify n8n (Workflow 1: submission -> AI -> store -> email/Slack)
  notifyN8n({
    event: 'feedback.created',
    feedbackId: feedback._id,
    title: feedback.title,
    department,
    sentiment: feedback.ai.sentiment.label,
    confidenceScore: feedback.ai.sentiment.confidenceScore,
  });

  sendSuccess(res, 201, 'Feedback submitted and analyzed successfully', { feedback });
});

// @desc    List feedback with filters, search, and pagination (dashboard/table use)
// @route   GET /api/feedback
// @access  Private (Officer/Admin)
export const getFeedback = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    department,
    category,
    status,
    sentiment,
    search,
    sortBy = '-createdAt',
  } = req.query;

  const query = {};
  if (department) query.department = department;
  if (category) query.category = category;
  if (status) query.status = status;
  if (sentiment) query['ai.sentiment.label'] = sentiment;
  if (search) query.$text = { $search: search };

  const skip = (Number(page) - 1) * Number(limit);

  const [items, total] = await Promise.all([
    Feedback.find(query)
      .populate('citizen', 'name email')
      .populate('department', 'name code')
      .populate('category', 'name')
      .populate('approvedBy', 'name')
      .sort(sortBy)
      .skip(skip)
      .limit(Number(limit)),
    Feedback.countDocuments(query),
  ]);

  sendSuccess(res, 200, 'Feedback fetched', { items }, {
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / Number(limit)),
  });
});

// @desc    Get the logged-in citizen's own feedback history
// @route   GET /api/feedback/my
// @access  Private (Citizen)
export const getMyFeedback = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const [items, total] = await Promise.all([
    Feedback.find({ citizen: req.user.id })
      .populate('department', 'name code')
      .populate('category', 'name')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit)),
    Feedback.countDocuments({ citizen: req.user.id }),
  ]);

  sendSuccess(res, 200, 'Your feedback fetched', { items }, {
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / Number(limit)),
  });
});

// @desc    Get a single feedback record
// @route   GET /api/feedback/:id
// @access  Private (owner citizen, or officer/admin)
export const getFeedbackById = asyncHandler(async (req, res) => {
  const feedback = await Feedback.findById(req.params.id)
    .populate('citizen', 'name email')
    .populate('department', 'name code')
    .populate('category', 'name')
    .populate('policy', 'title')
    .populate('approvedBy', 'name');

  if (!feedback) throw new ApiError(404, 'Feedback not found');

  const isOwner = req.user.role === 'citizen' && feedback.citizen._id.toString() === req.user.id;
  const isStaff = req.user.role === 'officer' || req.user.role === 'admin';
  if (!isOwner && !isStaff) throw new ApiError(403, 'Not authorized to view this feedback');

  sendSuccess(res, 200, 'Feedback fetched', { feedback });
});

// @desc    Update feedback (citizen can edit their own while pending; staff can edit any)
// @route   PUT /api/feedback/:id
// @access  Private
export const updateFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.findById(req.params.id);
  if (!feedback) throw new ApiError(404, 'Feedback not found');

  const isOwner = req.user.role === 'citizen' && feedback.citizen.toString() === req.user.id;
  const isStaff = req.user.role === 'officer' || req.user.role === 'admin';
  if (!isOwner && !isStaff) throw new ApiError(403, 'Not authorized to edit this feedback');
  if (isOwner && feedback.status !== 'pending') {
    throw new ApiError(400, 'Feedback can only be edited while still pending review');
  }

  const citizenEditableFields = ['title', 'description', 'rating', 'location', 'category'];
  const staffEditableFields = ['status', 'isPublic'];
  const editable = isOwner ? citizenEditableFields : [...citizenEditableFields, ...staffEditableFields];

  let reanalyze = false;
  editable.forEach((field) => {
    if (req.body[field] !== undefined) {
      if ((field === 'title' || field === 'description') && req.body[field] !== feedback[field]) {
        reanalyze = true;
      }
      feedback[field] = req.body[field];
    }
  });

  if (reanalyze) {
    const analysis = await analyzeFeedback({ title: feedback.title, description: feedback.description });
    feedback.ai = { ...analysis, processedAt: new Date() };
  }

  await feedback.save();
  sendSuccess(res, 200, 'Feedback updated', { feedback });
});

// @desc    Delete feedback (owner citizen while pending, or admin at any time)
// @route   DELETE /api/feedback/:id
// @access  Private
export const deleteFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.findById(req.params.id);
  if (!feedback) throw new ApiError(404, 'Feedback not found');

  const isOwner = req.user.role === 'citizen' && feedback.citizen.toString() === req.user.id;
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAdmin) throw new ApiError(403, 'Not authorized to delete this feedback');
  if (isOwner && feedback.status !== 'pending') {
    throw new ApiError(400, 'Feedback can only be deleted while still pending review');
  }

  await feedback.deleteOne();
  sendSuccess(res, 200, 'Feedback deleted');
});

// @desc    Approve or reject a feedback submission
// @route   PUT /api/feedback/:id/approve
// @access  Private (Officer/Admin)
export const approveFeedback = asyncHandler(async (req, res) => {
  const { decision } = req.body; // 'approved' | 'rejected'
  if (!['approved', 'rejected'].includes(decision)) {
    throw new ApiError(400, "decision must be 'approved' or 'rejected'");
  }

  const feedback = await Feedback.findById(req.params.id);
  if (!feedback) throw new ApiError(404, 'Feedback not found');

  feedback.status = decision;
  feedback.approvedBy = req.user.id;
  feedback.approvedAt = new Date();
  await feedback.save();

  Notification.create({
    recipient: feedback.citizen,
    recipientModel: 'User',
    type: decision === 'approved' ? 'feedback_approved' : 'feedback_rejected',
    title: `Your feedback was ${decision}`,
    message: `"${feedback.title}" has been ${decision} by a government officer.`,
    relatedFeedback: feedback._id,
    link: `/citizen/my-feedback`,
  }).catch((err) => console.error('Citizen notification failed:', err.message));

  sendSuccess(res, 200, `Feedback ${decision}`, { feedback });
});
