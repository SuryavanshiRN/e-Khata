import axios from 'axios';

const API_URL = 'http://localhost:5000/api/reminders';

// Get auth token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Create new reminder
export const createReminder = async (reminderData) => {
  const response = await axios.post(API_URL, reminderData, {
    headers: getAuthHeader()
  });
  return response.data;
};

// Get all reminders
export const getReminders = async (params = {}) => {
  const response = await axios.get(API_URL, {
    params,
    headers: getAuthHeader()
  });
  return response.data;
};

// Get single reminder
export const getReminder = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`, {
    headers: getAuthHeader()
  });
  return response.data;
};

// Update reminder
export const updateReminder = async (id, reminderData) => {
  const response = await axios.put(`${API_URL}/${id}`, reminderData, {
    headers: getAuthHeader()
  });
  return response.data;
};

// Delete reminder
export const deleteReminder = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`, {
    headers: getAuthHeader()
  });
  return response.data;
};

// Pause reminder
export const pauseReminder = async (id) => {
  const response = await axios.put(`${API_URL}/${id}/pause`, {}, {
    headers: getAuthHeader()
  });
  return response.data;
};

// Resume reminder
export const resumeReminder = async (id) => {
  const response = await axios.put(`${API_URL}/${id}/resume`, {}, {
    headers: getAuthHeader()
  });
  return response.data;
};

// Complete reminder
export const completeReminder = async (id) => {
  const response = await axios.put(`${API_URL}/${id}/complete`, {}, {
    headers: getAuthHeader()
  });
  return response.data;
};

// Send test notification
export const testNotification = async (id) => {
  const response = await axios.post(`${API_URL}/${id}/test-notification`, {}, {
    headers: getAuthHeader()
  });
  return response.data;
};

// Get upcoming reminders for dashboard
export const getUpcomingReminders = async () => {
  const response = await axios.get(`${API_URL}/upcoming/dashboard`, {
    headers: getAuthHeader()
  });
  return response.data;
};
