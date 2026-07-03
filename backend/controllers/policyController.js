import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess, ApiError } from '../utils/apiResponse.js';
import Policy from '../models/Policy.js';
import { logActivity } from '../middlewares/activityLogger.js';

// @desc    List policies open for consultation (with basic filtering/search)
// @route   GET /api/policies
// @access  Public
export const getPolicies = asyncHandler(async (req, res) => {
  const { department, category, status, search, page = 1, limit = 12 } = req.query;
  const query = {};
  if (department) query.department = department;
  if (category) query.category = category;
  if (status) query.status = status;
  if (search) query.$text = { $search: search };

  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Policy.find(query)
      .populate('department', 'name code')
      .populate('category', 'name')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit)),
    Policy.countDocuments(query),
  ]);

  sendSuccess(res, 200, 'Policies fetched', { items }, {
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / Number(limit)),
  });
});

// @route   GET /api/policies/:id
// @access  Public
export const getPolicyById = asyncHandler(async (req, res) => {
  const policy = await Policy.findByIdAndUpdate(
    req.params.id,
    { $inc: { viewCount: 1 } },
    { new: true }
  )
    .populate('department', 'name code')
    .populate('category', 'name')
    .populate('createdBy', 'name');

  if (!policy) throw new ApiError(404, 'Policy not found');
  sendSuccess(res, 200, 'Policy fetched', { policy });
});

// @route   POST /api/policies
// @access  Private (Admin)
export const createPolicy = asyncHandler(async (req, res) => {
  const { title, description, department, category, status, documentUrl, tags, consultationStartDate, consultationEndDate } = req.body;
  if (!title || !description || !department) {
    throw new ApiError(400, 'title, description, and department are required');
  }

  const policy = await Policy.create({
    title,
    description,
    department,
    category,
    status,
    documentUrl,
    tags,
    consultationStartDate,
    consultationEndDate,
    createdBy: req.user.id,
  });

  logActivity(req, { action: 'policy.create', targetType: 'Policy', targetId: policy._id, details: { title } });
  sendSuccess(res, 201, 'Policy created', { policy });
});

// @route   PUT /api/policies/:id
// @access  Private (Admin)
export const updatePolicy = asyncHandler(async (req, res) => {
  const allowedFields = [
    'title', 'description', 'department', 'category', 'status',
    'documentUrl', 'tags', 'consultationStartDate', 'consultationEndDate',
  ];
  const updates = {};
  allowedFields.forEach((f) => {
    if (req.body[f] !== undefined) updates[f] = req.body[f];
  });

  const policy = await Policy.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  if (!policy) throw new ApiError(404, 'Policy not found');

  logActivity(req, { action: 'policy.update', targetType: 'Policy', targetId: policy._id, details: updates });
  sendSuccess(res, 200, 'Policy updated', { policy });
});

// @route   DELETE /api/policies/:id
// @access  Private (Admin)
export const deletePolicy = asyncHandler(async (req, res) => {
  const policy = await Policy.findByIdAndDelete(req.params.id);
  if (!policy) throw new ApiError(404, 'Policy not found');

  logActivity(req, { action: 'policy.delete', targetType: 'Policy', targetId: policy._id });
  sendSuccess(res, 200, 'Policy deleted');
});
