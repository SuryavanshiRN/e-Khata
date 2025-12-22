import API from './axios';

export const getPortfolio = () => API.get('/portfolios');
export const addStock = (data) => API.post('/portfolios', data);
export const removeStock = (id) => API.delete(`/portfolios/${id}`);
