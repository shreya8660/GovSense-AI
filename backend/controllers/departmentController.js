import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess, ApiError } from '../utils/apiResponse.js';
import Department from '../models/Department.js';
import { logActivity } from '../middlewares/activityLogger.js';

// @desc    List departments (used to populate the feedback form + admin table)
// @route   GET /api/departments
// @access  Public
export const getDepartments = asyncHandler(async (req, res) => {
  const { activeOnly } = req.query;
  const query = activeOnly === 'true' ? { isActive: true } : {};
  const departments = await Department.find(query).populate('headOfficer', 'name email').sort('name');
  sendSuccess(res, 200, 'Departments fetched', { departments });
});

// @desc    Get a single department
// @route   GET /api/departments/:id
// @access  Public
export const getDepartmentById = asyncHandler(async (req, res) => {
  const department = await Department.findById(req.params.id).populate('headOfficer', 'name email');
  if (!department) throw new ApiError(404, 'Department not found');
  sendSuccess(res, 200, 'Department fetched', { department });
});

// @desc    Create a department
// @route   POST /api/departments
// @access  Private (Admin)
export const createDepartment = asyncHandler(async (req, res) => {
  const { name, code, description, contactEmail, contactPhone } = req.body;
  if (!name || !code) throw new ApiError(400, 'Name and code are required');

  const department = await Department.create({ name, code, description, contactEmail, contactPhone });
  logActivity(req, { action: 'department.create', targetType: 'Department', targetId: department._id, details: { name } });
  sendSuccess(res, 201, 'Department created', { department });
});

// @desc    Update a department
// @route   PUT /api/departments/:id
// @access  Private (Admin)
export const updateDepartment = asyncHandler(async (req, res) => {
  const allowedFields = ['name', 'code', 'description', 'headOfficer', 'contactEmail', 'contactPhone', 'isActive'];
  const updates = {};
  allowedFields.forEach((f) => {
    if (req.body[f] !== undefined) updates[f] = req.body[f];
  });

  const department = await Department.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  if (!department) throw new ApiError(404, 'Department not found');

  logActivity(req, { action: 'department.update', targetType: 'Department', targetId: department._id, details: updates });
  sendSuccess(res, 200, 'Department updated', { department });
});

// @desc    Delete a department
// @route   DELETE /api/departments/:id
// @access  Private (Admin)
export const deleteDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findByIdAndDelete(req.params.id);
  if (!department) throw new ApiError(404, 'Department not found');

  logActivity(req, { action: 'department.delete', targetType: 'Department', targetId: department._id });
  sendSuccess(res, 200, 'Department deleted');
});
