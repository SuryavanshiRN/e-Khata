import axios from './axios';

// Get all recurring expenses
export const getRecurringExpenses = async (params) => {
  const response = await axios.get('/recurring-expenses', { params });
  return response.data;
};

// Get single recurring expense
export const getRecurringExpense = async (id) => {
  const response = await axios.get(`/recurring-expenses/${id}`);
  return response.data;
};

// Create recurring expense
export const createRecurringExpense = async (data) => {
  const response = await axios.post('/recurring-expenses', data);
  return response.data;
};

// Update recurring expense
export const updateRecurringExpense = async (id, data) => {
  const response = await axios.put(`/recurring-expenses/${id}`, data);
  return response.data;
};

// Delete recurring expense
export const deleteRecurringExpense = async (id) => {
  const response = await axios.delete(`/recurring-expenses/${id}`);
  return response.data;
};

// Toggle recurring expense active status
export const toggleRecurringExpense = async (id) => {
  const response = await axios.patch(`/recurring-expenses/${id}/toggle`);
  return response.data;
};
