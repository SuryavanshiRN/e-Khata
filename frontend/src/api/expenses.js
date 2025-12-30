import axios from './axios';

export const getExpenses = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const response = await axios.get(`/expenses?${params}`);
  return response.data;
};

export const getExpense = async (id) => {
  const response = await axios.get(`/expenses/${id}`);
  return response.data;
};

export const createExpense = async (expenseData) => {
  const response = await axios.post('/expenses', expenseData);
  return response.data;
};

export const updateExpense = async (id, expenseData) => {
  const response = await axios.put(`/expenses/${id}`, expenseData);
  return response.data;
};

export const deleteExpense = async (id) => {
  const response = await axios.delete(`/expenses/${id}`);
  return response.data;
};
