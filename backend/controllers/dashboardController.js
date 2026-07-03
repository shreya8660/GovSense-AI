import mongoose from 'mongoose';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import Feedback from '../models/Feedback.js';
import Department from '../models/Department.js';

// @desc    Stat cards: total / positive / negative / neutral / department count
// @route   GET /api/dashboard/stats?department=
// @access  Private (Officer/Admin, or n8n via API key)
export const getStats = asyncHandler(async (req, res) => {
  const { department } = req.query;
  const match = department ? { department: new mongoose.Types.ObjectId(department) } : {};

  const [totals] = await Feedback.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        positive: { $sum: { $cond: [{ $eq: ['$ai.sentiment.label', 'positive'] }, 1, 0] } },
        negative: { $sum: { $cond: [{ $eq: ['$ai.sentiment.label', 'negative'] }, 1, 0] } },
        neutral: { $sum: { $cond: [{ $eq: ['$ai.sentiment.label', 'neutral'] }, 1, 0] } },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  const departmentCount = await Department.countDocuments({ isActive: true });

  const stats = {
    total: totals?.total || 0,
    positive: totals?.positive || 0,
    negative: totals?.negative || 0,
    neutral: totals?.neutral || 0,
    avgRating: Number((totals?.avgRating || 0).toFixed(2)),
    departmentCount,
    negativePercentage: totals?.total ? Number(((totals.negative / totals.total) * 100).toFixed(1)) : 0,
  };

  sendSuccess(res, 200, 'Stats fetched', { stats });
});

// @desc    Chart data: sentiment pie, department-wise bar, monthly trend line
// @route   GET /api/dashboard/charts
// @access  Private (Officer/Admin, or n8n via API key)
export const getCharts = asyncHandler(async (req, res) => {
  // ---- Pie: overall sentiment distribution ----
  const pieRaw = await Feedback.aggregate([
    { $group: { _id: '$ai.sentiment.label', value: { $sum: 1 } } },
  ]);
  const pie = pieRaw
    .filter((row) => row._id)
    .map((row) => ({ name: row._id, value: row.value }));

  // ---- Bar: department-wise sentiment breakdown ----
  const barRaw = await Feedback.aggregate([
    {
      $group: {
        _id: { department: '$department', sentiment: '$ai.sentiment.label' },
        count: { $sum: 1 },
      },
    },
    { $lookup: { from: 'departments', localField: '_id.department', foreignField: '_id', as: 'dept' } },
    { $unwind: { path: '$dept', preserveNullAndEmptyArrays: true } },
  ]);

  const barMap = {};
  barRaw.forEach((row) => {
    const name = row.dept?.name || 'Unassigned';
    if (!barMap[name]) barMap[name] = { department: name, positive: 0, negative: 0, neutral: 0 };
    if (row._id.sentiment) barMap[name][row._id.sentiment] = row.count;
  });
  const bar = Object.values(barMap);

  // ---- Line: monthly trend over the last 6 months ----
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const lineRaw = await Feedback.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        total: { $sum: 1 },
        positive: { $sum: { $cond: [{ $eq: ['$ai.sentiment.label', 'positive'] }, 1, 0] } },
        negative: { $sum: { $cond: [{ $eq: ['$ai.sentiment.label', 'negative'] }, 1, 0] } },
        neutral: { $sum: { $cond: [{ $eq: ['$ai.sentiment.label', 'neutral'] }, 1, 0] } },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const line = lineRaw.map((row) => ({
    month: `${monthNames[row._id.month - 1]} ${row._id.year}`,
    total: row.total,
    positive: row.positive,
    negative: row.negative,
    neutral: row.neutral,
  }));

  sendSuccess(res, 200, 'Chart data fetched', { pie, bar, line });
});
