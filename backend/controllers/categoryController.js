import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess, ApiError } from '../utils/apiResponse.js';
import Category from '../models/Category.js';
import { logActivity } from '../middlewares/activityLogger.js';

// @route   GET /api/categories
// @access  Public
export const getCategories = asyncHandler(async (req, res) => {
  const { activeOnly } = req.query;
  const query = activeOnly === 'true' ? { isActive: true } : {};
  const categories = await Category.find(query).sort('name');
  sendSuccess(res, 200, 'Categories fetched', { categories });
});

// @route   POST /api/categories
// @access  Private (Admin)
export const createCategory = asyncHandler(async (req, res) => {
  const { name, description, icon } = req.body;
  if (!name) throw new ApiError(400, 'Name is required');

  const category = await Category.create({ name, description, icon });
  logActivity(req, { action: 'category.create', targetType: 'Category', targetId: category._id, details: { name } });
  sendSuccess(res, 201, 'Category created', { category });
});

// @route   PUT /api/categories/:id
// @access  Private (Admin)
export const updateCategory = asyncHandler(async (req, res) => {
  const allowedFields = ['name', 'description', 'icon', 'isActive'];
  const updates = {};
  allowedFields.forEach((f) => {
    if (req.body[f] !== undefined) updates[f] = req.body[f];
  });

  const category = await Category.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  if (!category) throw new ApiError(404, 'Category not found');

  logActivity(req, { action: 'category.update', targetType: 'Category', targetId: category._id, details: updates });
  sendSuccess(res, 200, 'Category updated', { category });
});

// @route   DELETE /api/categories/:id
// @access  Private (Admin)
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) throw new ApiError(404, 'Category not found');

  logActivity(req, { action: 'category.delete', targetType: 'Category', targetId: category._id });
  sendSuccess(res, 200, 'Category deleted');
});
