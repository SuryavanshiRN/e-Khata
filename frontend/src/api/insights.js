import axios from './axios';

export const getInsights = async () => {
  const response = await axios.get('/insights');
  return response.data;
};
