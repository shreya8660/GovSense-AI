import PDFDocument from 'pdfkit';

/**
 * Streams a feedback report into an in-memory PDF buffer.
 * @param {{title:string, dateRange:{start:Date,end:Date}, stats:object, items:Array}} data
 * @returns {Promise<Buffer>}
 */
export const generateFeedbackPDF = ({ title, dateRange, stats, items }) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40 });
    const buffers = [];
    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    // ---- Header ----
    doc.fontSize(20).fillColor('#1d4ed8').text('GovSense AI', { align: 'center' });
    doc.fontSize(14).fillColor('#1e293b').text(title, { align: 'center' });
    if (dateRange) {
      doc
        .fontSize(10)
        .fillColor('#64748b')
        .text(
          `${new Date(dateRange.start).toLocaleDateString()} - ${new Date(dateRange.end).toLocaleDateString()}`,
          { align: 'center' }
        );
    }
    doc.moveDown(1.5);

    // ---- Summary stats ----
    if (stats) {
      doc.fontSize(12).fillColor('#1e293b').text('Summary', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10).fillColor('#334155');
      doc.text(`Total Feedback: ${stats.total ?? 0}`);
      doc.text(`Positive: ${stats.positive ?? 0}`);
      doc.text(`Negative: ${stats.negative ?? 0}`);
      doc.text(`Neutral: ${stats.neutral ?? 0}`);
      doc.moveDown(1);
    }

    // ---- Feedback listing ----
    doc.fontSize(12).fillColor('#1e293b').text('Feedback Details', { underline: true });
    doc.moveDown(0.5);

    items.forEach((item, idx) => {
      if (doc.y > 700) doc.addPage();
      doc.fontSize(10).fillColor('#1d4ed8').text(`${idx + 1}. ${item.title}`);
      doc
        .fontSize(9)
        .fillColor('#475569')
        .text(
          `Department: ${item.department?.name || '-'}  |  Sentiment: ${item.ai?.sentiment?.label || '-'}  |  Rating: ${item.rating}/5`
        );
      doc.fontSize(9).fillColor('#334155').text(item.description, { width: 480 });
      doc.moveDown(0.7);
    });

    doc.end();
  });
};
