import axios from 'axios';

const API_URL = 'http://localhost:5000/api/sips';

// Get auth token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Create new SIP
export const createSIP = async (sipData) => {
  const response = await axios.post(API_URL, sipData, {
    headers: getAuthHeader()
  });
  return response.data;
};

// Get all SIPs
export const getSIPs = async (activeOnly = true) => {
  const response = await axios.get(API_URL, {
    params: { active: activeOnly },
    headers: getAuthHeader()
  });
  return response.data;
};

// Get single SIP with detailed analysis
export const getSIP = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`, {
    headers: getAuthHeader()
  });
  return response.data;
};

// Update SIP
export const updateSIP = async (id, sipData) => {
  const response = await axios.put(`${API_URL}/${id}`, sipData, {
    headers: getAuthHeader()
  });
  return response.data;
};

// Delete SIP
export const deleteSIP = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`, {
    headers: getAuthHeader()
  });
  return response.data;
};

// Search for fund symbols
export const searchFunds = async (query) => {
  const response = await axios.get(`${API_URL}/search-funds`, {
    params: { query },
    headers: getAuthHeader()
  });
  return response.data;
};

// Refresh SIP valuation
export const refreshSIP = async (id) => {
  const response = await axios.post(`${API_URL}/${id}/refresh`, {}, {
    headers: getAuthHeader()
  });
  return response.data;
};
