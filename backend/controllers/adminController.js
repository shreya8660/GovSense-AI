import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess, ApiError } from '../utils/apiResponse.js';
import User from '../models/User.js';
import Officer from '../models/Officer.js';
import Feedback from '../models/Feedback.js';
import Department from '../models/Department.js';
import ActivityLog from '../models/ActivityLog.js';
import Settings from '../models/Settings.js';
import Notification from '../models/Notification.js';
import { logActivity } from '../middlewares/activityLogger.js';

/* ------------------------------- Citizens -------------------------------- */

// @route   GET /api/admin/users?search=&page=&limit=
// @access  Private (Admin)
export const getUsers = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 15 } = req.query;
  const query = search ? { $or: [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }] } : {};
  const skip = (Number(page) - 1) * Number(limit);

  const [items, total] = await Promise.all([
    User.find(query).sort('-createdAt').skip(skip).limit(Number(limit)),
    User.countDocuments(query),
  ]);

  sendSuccess(res, 200, 'Users fetched', { items }, { total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
});

// @route   PUT /api/admin/users/:id/status   body: { isActive }
// @access  Private (Admin)
export const updateUserStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true });
  if (!user) throw new ApiError(404, 'User not found');

  logActivity(req, { action: 'user.status_update', targetType: 'User', targetId: user._id, details: { isActive } });
  sendSuccess(res, 200, 'User status updated', { user: user.toSafeObject() });
});

// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');

  logActivity(req, { action: 'user.delete', targetType: 'User', targetId: user._id });
  sendSuccess(res, 200, 'User deleted');
});

/* -------------------------------- Officers -------------------------------- */

// @route   GET /api/admin/officers?search=&department=&page=&limit=
// @access  Private (Admin)
export const getOfficers = asyncHandler(async (req, res) => {
  const { search, department, page = 1, limit = 15 } = req.query;
  const query = {};
  if (department) query.department = department;
  if (search) query.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];

  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Officer.find(query).populate('department', 'name code').sort('-createdAt').skip(skip).limit(Number(limit)),
    Officer.countDocuments(query),
  ]);

  sendSuccess(res, 200, 'Officers fetched', { items }, { total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
});

// @desc    Admin directly creates an officer account (auto-approved)
// @route   POST /api/admin/officers
// @access  Private (Admin)
export const createOfficer = asyncHandler(async (req, res) => {
  const { name, email, password, phone, department, designation, employeeId } = req.body;
  if (!name || !email || !password || !department) {
    throw new ApiError(400, 'name, email, password, and department are required');
  }

  const existing = await Officer.findOne({ email });
  if (existing) throw new ApiError(400, 'An officer with this email already exists');

  const officer = await Officer.create({
    name, email, password, phone, department, designation, employeeId, isApproved: true,
  });

  logActivity(req, { action: 'officer.create', targetType: 'Officer', targetId: officer._id, details: { email } });
  sendSuccess(res, 201, 'Officer account created', { officer: officer.toSafeObject() });
});

// @route   PUT /api/admin/officers/:id/approve   body: { approve: boolean }
// @access  Private (Admin)
export const approveOfficer = asyncHandler(async (req, res) => {
  const { approve } = req.body;
  const officer = await Officer.findByIdAndUpdate(req.params.id, { isApproved: !!approve }, { new: true });
  if (!officer) throw new ApiError(404, 'Officer not found');

  Notification.create({
    recipient: officer._id,
    recipientModel: 'Officer',
    type: 'system',
    title: approve ? 'Account approved' : 'Account approval revoked',
    message: approve
      ? 'Your officer account has been approved. You can now log in.'
      : 'Your officer account approval has been revoked by an administrator.',
  }).catch((err) => console.error('Officer notification failed:', err.message));

  logActivity(req, { action: 'officer.approve', targetType: 'Officer', targetId: officer._id, details: { approve } });
  sendSuccess(res, 200, `Officer ${approve ? 'approved' : 'unapproved'}`, { officer: officer.toSafeObject() });
});

// @route   PUT /api/admin/officers/:id   (edit department/designation/isActive)
// @access  Private (Admin)
export const updateOfficer = asyncHandler(async (req, res) => {
  const allowedFields = ['name', 'phone', 'department', 'designation', 'employeeId', 'isActive'];
  const updates = {};
  allowedFields.forEach((f) => {
    if (req.body[f] !== undefined) updates[f] = req.body[f];
  });

  const officer = await Officer.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  if (!officer) throw new ApiError(404, 'Officer not found');

  logActivity(req, { action: 'officer.update', targetType: 'Officer', targetId: officer._id, details: updates });
  sendSuccess(res, 200, 'Officer updated', { officer: officer.toSafeObject() });
});

// @route   DELETE /api/admin/officers/:id
// @access  Private (Admin)
export const deleteOfficer = asyncHandler(async (req, res) => {
  const officer = await Officer.findByIdAndDelete(req.params.id);
  if (!officer) throw new ApiError(404, 'Officer not found');

  logActivity(req, { action: 'officer.delete', targetType: 'Officer', targetId: officer._id });
  sendSuccess(res, 200, 'Officer deleted');
});

/* -------------------------------- Analytics -------------------------------- */

// @desc    Platform-wide analytics for the Admin dashboard (beyond officer-level stats)
// @route   GET /api/admin/analytics
// @access  Private (Admin)
export const getAnalytics = asyncHandler(async (req, res) => {
  const [userCount, officerCount, departmentCount, feedbackCount, pendingOfficers, pendingFeedback] = await Promise.all([
    User.countDocuments(),
    Officer.countDocuments(),
    Department.countDocuments(),
    Feedback.countDocuments(),
    Officer.countDocuments({ isApproved: false }),
    Feedback.countDocuments({ status: 'pending' }),
  ]);

  // Citizen growth over the last 6 months
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);

  const growthRaw = await User.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const userGrowth = growthRaw.map((row) => ({
    month: `${monthNames[row._id.month - 1]} ${row._id.year}`,
    count: row.count,
  }));

  sendSuccess(res, 200, 'Analytics fetched', {
    userCount,
    officerCount,
    departmentCount,
    feedbackCount,
    pendingOfficers,
    pendingFeedback,
    userGrowth,
  });
});

/* -------------------------------- Logs -------------------------------- */

// @route   GET /api/admin/logs?action=&page=&limit=
// @access  Private (Admin)
export const getActivityLogs = asyncHandler(async (req, res) => {
  const { action, page = 1, limit = 25 } = req.query;
  const query = action ? { action: new RegExp(action, 'i') } : {};
  const skip = (Number(page) - 1) * Number(limit);

  const [items, total] = await Promise.all([
    ActivityLog.find(query).sort('-createdAt').skip(skip).limit(Number(limit)),
    ActivityLog.countDocuments(query),
  ]);

  sendSuccess(res, 200, 'Activity logs fetched', { items }, { total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
});

/* -------------------------------- Settings -------------------------------- */

// @route   GET /api/admin/settings
// @access  Private (Admin)
export const getSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.getSettings();
  sendSuccess(res, 200, 'Settings fetched', { settings });
});

// @route   PUT /api/admin/settings
// @access  Private (Admin)
export const updateSettings = asyncHandler(async (req, res) => {
  const allowedFields = ['siteName', 'negativeAlertThreshold', 'maintenanceMode', 'supportEmail', 'allowCitizenRegistration'];
  const updates = {};
  allowedFields.forEach((f) => {
    if (req.body[f] !== undefined) updates[f] = req.body[f];
  });

  const settings = await Settings.findOneAndUpdate({ singleton: 'main' }, updates, {
    new: true,
    upsert: true,
    runValidators: true,
  });

  logActivity(req, { action: 'settings.update', targetType: 'Settings', details: updates });
  sendSuccess(res, 200, 'Settings updated', { settings });
});
