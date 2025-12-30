import axios from './axios';

export const calculateSIP = async (monthly, rate, years) => {
  const response = await axios.post('/calculators/sip-calc', {
    monthly,
    rate,
    years
  });
  return response.data;
};

export const calculateEMI = async (principal, rate, months) => {
  const response = await axios.post('/calculators/emi-calc', {
    principal,
    rate,
    months
  });
  return response.data;
};

export const getCalculatorHistory = async (type = null) => {
  const params = type ? { type } : {};
  const response = await axios.get('/calculators/history', { params });
  return response.data;
};

export const deleteCalculatorResult = async (id) => {
  const response = await axios.delete(`/calculators/${id}`);
  return response.data;
};
