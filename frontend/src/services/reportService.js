import api from './api';

const downloadFile = async (url, params, filename) => {
  const response = await api.get(url, { params, responseType: 'blob' });
  const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = blobUrl;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
};

export const reportService = {
  downloadPdf: (params) => downloadFile('/report/pdf', params, 'govsense-feedback-report.pdf'),
  downloadExcel: (params) => downloadFile('/report/excel', params, 'govsense-feedback-report.xlsx'),
};
