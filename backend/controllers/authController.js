import crypto from 'crypto';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess, ApiError } from '../utils/apiResponse.js';
import generateToken from '../utils/generateToken.js';
import User from '../models/User.js';
import Officer from '../models/Officer.js';
import Admin from '../models/Admin.js';
import {
  sendEmail,
  verificationEmailTemplate,
  resetPasswordEmailTemplate,
} from '../services/Email/emailService.js';

const roleModelMap = { citizen: User, officer: Officer, admin: Admin };

// @desc    Register a new citizen account
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, preferredLanguage } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, 'Name, email, and password are required');
  }

  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(400, 'An account with this email already exists');

  const user = await User.create({ name, email, password, phone, preferredLanguage });

  const verifyToken = user.getEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${verifyToken}`;
  sendEmail({
    to: user.email,
    subject: 'Welcome to GovSense AI - Verify your email',
    html: verificationEmailTemplate(user.name, verifyUrl),
  }).catch((err) => console.error('Email send failed:', err.message));

  const token = generateToken(user._id, 'citizen');
  sendSuccess(res, 201, 'Registration successful', {
    token,
    role: 'citizen',
    user: user.toSafeObject(),
  });
});

// @desc    Login for citizen, officer, or admin (role decides which collection to check)
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    throw new ApiError(400, 'Email, password, and role are required');
  }

  const Model = roleModelMap[role];
  if (!Model) throw new ApiError(400, 'Invalid role specified');

  const account = await Model.findOne({ email }).select('+password');
  if (!account) throw new ApiError(401, 'Invalid credentials');

  if (account.isActive === false) throw new ApiError(403, 'This account has been deactivated');
  if (role === 'officer' && !account.isApproved) {
    throw new ApiError(403, 'Your officer account is pending admin approval');
  }

  const isMatch = await account.matchPassword(password);
  if (!isMatch) throw new ApiError(401, 'Invalid credentials');

  account.lastLogin = new Date();
  await account.save({ validateBeforeSave: false });

  const token = generateToken(account._id, role);
  sendSuccess(res, 200, 'Login successful', {
    token,
    role,
    user: account.toSafeObject(),
  });
});

// @desc    Logout (JWT is stateless - this just gives the client a clean endpoint to call)
// @route   POST /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res) => {
  sendSuccess(res, 200, 'Logged out successfully');
});

// @desc    Get the logged-in account's profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = asyncHandler(async (req, res) => {
  const Model = roleModelMap[req.user.role];
  let query = Model.findById(req.user.id);
  if (req.user.role === 'officer') query = query.populate('department', 'name code');
  const account = await query;
  if (!account) throw new ApiError(404, 'Account not found');
  sendSuccess(res, 200, 'Profile fetched', { role: req.user.role, user: account.toSafeObject() });
});

// @desc    Update editable profile fields
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const Model = roleModelMap[req.user.role];
  const allowedFields = ['name', 'phone', 'avatar', 'preferredLanguage'];
  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const account = await Model.findByIdAndUpdate(req.user.id, updates, {
    new: true,
    runValidators: true,
  });
  sendSuccess(res, 200, 'Profile updated', { user: account.toSafeObject() });
});

// @desc    Change password while logged in
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    throw new ApiError(400, 'Current and new password are required');
  }

  const Model = roleModelMap[req.user.role];
  const account = await Model.findById(req.user.id).select('+password');
  const isMatch = await account.matchPassword(currentPassword);
  if (!isMatch) throw new ApiError(401, 'Current password is incorrect');

  account.password = newPassword;
  await account.save();
  sendSuccess(res, 200, 'Password changed successfully');
});

// @desc    Request a password reset email
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email, role } = req.body;
  const Model = roleModelMap[role];
  if (!Model) throw new ApiError(400, 'Invalid role specified');

  const account = await Model.findOne({ email });
  // Respond identically whether or not the account exists, to avoid leaking registered emails
  if (account) {
    const resetToken = account.getResetPasswordToken();
    await account.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}?role=${role}`;
    sendEmail({
      to: account.email,
      subject: 'GovSense AI - Password Reset Request',
      html: resetPasswordEmailTemplate(account.name, resetUrl),
    }).catch((err) => console.error('Email send failed:', err.message));
  }

  sendSuccess(res, 200, 'If an account exists for that email, a reset link has been sent');
});

// @desc    Reset password using the emailed token
// @route   PUT /api/auth/reset-password/:token?role=citizen|officer|admin
// @access  Public
export const resetPassword = asyncHandler(async (req, res) => {
  const { role } = req.query;
  const { password } = req.body;
  const Model = roleModelMap[role];
  if (!Model) throw new ApiError(400, 'Invalid role specified');
  if (!password) throw new ApiError(400, 'New password is required');

  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const account = await Model.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  }).select('+resetPasswordToken +resetPasswordExpire');

  if (!account) throw new ApiError(400, 'Reset token is invalid or has expired');

  account.password = password;
  account.resetPasswordToken = undefined;
  account.resetPasswordExpire = undefined;
  await account.save();

  sendSuccess(res, 200, 'Password reset successful. You can now log in');
});

// @desc    Verify a citizen's email address
// @route   GET /api/auth/verify-email/:token
// @access  Public
export const verifyEmail = asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpire: { $gt: Date.now() },
  }).select('+emailVerificationToken +emailVerificationExpire');

  if (!user) throw new ApiError(400, 'Verification link is invalid or has expired');

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpire = undefined;
  await user.save({ validateBeforeSave: false });

  sendSuccess(res, 200, 'Email verified successfully');
});
