import ExcelJS from 'exceljs';

/**
 * Builds an in-memory .xlsx buffer from a list of feedback documents.
 * @param {{title:string, items:Array}} data
 * @returns {Promise<Buffer>}
 */
export const generateFeedbackExcel = async ({ title, items }) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'GovSense AI';
  const sheet = workbook.addWorksheet(title || 'Feedback Report');

  sheet.columns = [
    { header: 'Title', key: 'title', width: 30 },
    { header: 'Department', key: 'department', width: 20 },
    { header: 'Category', key: 'category', width: 18 },
    { header: 'Citizen', key: 'citizen', width: 22 },
    { header: 'Rating', key: 'rating', width: 10 },
    { header: 'Sentiment', key: 'sentiment', width: 14 },
    { header: 'Confidence', key: 'confidence', width: 12 },
    { header: 'Emotion', key: 'emotion', width: 14 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Submitted', key: 'createdAt', width: 20 },
  ];

  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDBEAFE' } };

  items.forEach((item) => {
    sheet.addRow({
      title: item.title,
      department: item.department?.name || '-',
      category: item.category?.name || '-',
      citizen: item.citizen?.name || '-',
      rating: item.rating,
      sentiment: item.ai?.sentiment?.label || '-',
      confidence: item.ai?.sentiment?.confidenceScore ?? '-',
      emotion: item.ai?.emotion || '-',
      status: item.status,
      createdAt: new Date(item.createdAt).toLocaleString(),
    });
  });

  return workbook.xlsx.writeBuffer();
};
