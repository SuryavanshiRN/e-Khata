import axios from './axios';

// Export transactions as PDF
export const exportPDF = async (params) => {
  const response = await axios.get('/export/pdf', {
    params,
    responseType: 'blob',
  });
  return response.data;
};

// Export transactions as CSV
export const exportCSV = async (params) => {
  const response = await axios.get('/export/csv', {
    params,
    responseType: 'blob',
  });
  return response.data;
};
