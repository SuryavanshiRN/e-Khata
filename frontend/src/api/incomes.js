import axios from './axios';

// Get all incomes
export const getIncomes = async (params) => {
  const response = await axios.get('/incomes', { params });
  return response.data;
};

// Get single income
export const getIncome = async (id) => {
  const response = await axios.get(`/incomes/${id}`);
  return response.data;
};

// Create income
export const createIncome = async (incomeData) => {
  const response = await axios.post('/incomes', incomeData);
  return response.data;
};

// Update income
export const updateIncome = async (id, incomeData) => {
  const response = await axios.put(`/incomes/${id}`, incomeData);
  return response.data;
};

// Delete income
export const deleteIncome = async (id) => {
  const response = await axios.delete(`/incomes/${id}`);
  return response.data;
};

// Store token in localStorage
export const storeToken = (token) => {
  localStorage.setItem('token', token);
};

// Get token from localStorage
export const getToken = () => {
  return localStorage.getItem('token');
};

// Remove token from localStorage
export const removeToken = () => {
  localStorage.removeItem('token');
};
