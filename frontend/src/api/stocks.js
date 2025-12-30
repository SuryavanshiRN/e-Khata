import axios from './axios';

// ✅ Matches backend routes EXACTLY
export const fetchQuote = (symbol) =>
  axios.get(`/stocks/quote/${symbol}`);

export const fetchOverview = (symbol) =>
  axios.get(`/stocks/overview/${symbol}`);

export const fetchIndicators = (symbol) =>
  axios.get(`/stocks/indicators/${symbol}`);
