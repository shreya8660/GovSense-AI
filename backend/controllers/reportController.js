import asyncHandler from '../utils/asyncHandler.js';
import Feedback from '../models/Feedback.js';
import Report from '../models/Report.js';
import { generateFeedbackPDF } from '../services/Report/pdfService.js';
import { generateFeedbackExcel } from '../services/Report/excelService.js';

const buildDateRange = (range, start, end) => {
  const now = new Date();
  if (start && end) return { start: new Date(start), end: new Date(end) };
  if (range === 'weekly') {
    const s = new Date(now);
    s.setDate(s.getDate() - 7);
    return { start: s, end: now };
  }
  if (range === 'monthly') {
    const s = new Date(now);
    s.setMonth(s.getMonth() - 1);
    return { start: s, end: now };
  }
  return { start: new Date(0), end: now }; // all time
};

const fetchReportData = async ({ department, range, start, end }) => {
  const dateRange = buildDateRange(range, start, end);
  const query = { createdAt: { $gte: dateRange.start, $lte: dateRange.end } };
  if (department) query.department = department;

  const items = await Feedback.find(query)
    .populate('citizen', 'name')
    .populate('department', 'name')
    .populate('category', 'name')
    .sort('-createdAt');

  const stats = items.reduce(
    (acc, item) => {
      acc.total += 1;
      const label = item.ai?.sentiment?.label;
      if (label) acc[label] = (acc[label] || 0) + 1;
      return acc;
    },
    { total: 0, positive: 0, negative: 0, neutral: 0 }
  );

  return { items, stats, dateRange };
};

const logReport = (req, { type, format, department, dateRange, stats }) => {
  Report.create({
    title: `Feedback Report (${format.toUpperCase()})`,
    type,
    format,
    department: department || null,
    dateRange,
    stats,
    generatedByModel: req.user.role === 'system' ? 'System' : req.user.role === 'admin' ? 'Admin' : 'Officer',
    generatedBy: req.user.role === 'system' ? null : req.user.id,
    status: 'completed',
  }).catch((err) => console.error('Report log failed:', err.message));
};

// @desc    Download a PDF feedback report
// @route   GET /api/report/pdf?department=&range=weekly|monthly&start=&end=
// @access  Private (Officer/Admin, or n8n via x-api-key)
export const downloadPdfReport = asyncHandler(async (req, res) => {
  const { department, range, start, end } = req.query;
  const { items, stats, dateRange } = await fetchReportData({ department, range, start, end });

  const pdfBuffer = await generateFeedbackPDF({ title: 'Feedback Sentiment Report', dateRange, stats, items });

  logReport(req, { type: range === 'weekly' ? 'weekly' : range === 'monthly' ? 'monthly' : 'custom', format: 'pdf', department, dateRange, stats });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="govsense-feedback-report.pdf"');
  res.send(pdfBuffer);
});

// @desc    Download an Excel feedback report
// @route   GET /api/report/excel?department=&range=weekly|monthly&start=&end=
// @access  Private (Officer/Admin, or n8n via x-api-key)
export const downloadExcelReport = asyncHandler(async (req, res) => {
  const { department, range, start, end } = req.query;
  const { items, stats, dateRange } = await fetchReportData({ department, range, start, end });

  const excelBuffer = await generateFeedbackExcel({ title: 'Feedback Report', items });

  logReport(req, { type: range === 'weekly' ? 'weekly' : range === 'monthly' ? 'monthly' : 'custom', format: 'excel', department, dateRange, stats });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="govsense-feedback-report.xlsx"');
  res.send(excelBuffer);
});
