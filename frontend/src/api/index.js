import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

API.interceptors.request.use((req) => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  if (userInfo?.token) {
    req.headers.Authorization = `Bearer ${userInfo.token}`;
  }
  return req;
});

export const fetchStock = (symbol) => API.get(`/stocks/${symbol}`);
export const getPortfolio = () => API.get('/portfolios');
export const addStock = (data) => API.post('/portfolios', data);
export const removeStock = (id) => API.delete(`/portfolios/${id}`);
