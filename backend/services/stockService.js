// backend/services/stockService.js
const axios = require('axios');

/**
 * Service uses Alpha Vantage for quotes, historicals and fundamentals.
 * Make sure STOCK_API_KEY is set in .env
 */

const API_KEY = process.env.STOCK_API_KEY;
const BASE = 'https://www.alphavantage.co/query';

if (!API_KEY) {
  console.warn('Warning: STOCK_API_KEY not set. Stock endpoints will fail.');
}

function alphaParams(params) {
  return { ...params, apikey: API_KEY };
}

async function fetchAlpha(params) {
  const res = await axios.get(BASE, { params: alphaParams(params), timeout: 15000 });
  return res.data;
}

/** Get latest quote using GLOBAL_QUOTE */
async function getQuote(symbol) {
  const data = await fetchAlpha({ function: 'GLOBAL_QUOTE', symbol });
  const q = data['Global Quote'];
  if (!q) throw new Error('No quote data');
  return {
    symbol: q['01. symbol'],
    price: parseFloat(q['05. price']),
    open: parseFloat(q['02. open']),
    high: parseFloat(q['03. high']),
    low: parseFloat(q['04. low']),
    volume: parseInt(q['06. volume'], 10),
    latestTradingDay: q['07. latest trading day'],
    previousClose: parseFloat(q['08. previous close']),
    change: parseFloat(q['09. change']),
    changePercent: q['10. change percent'],
  };
}

/** Get historical daily adjusted (returns array sorted ascending by date) */
async function getDailyHistory(symbol, outputsize = 'compact') {
  // outputsize: 'compact' (last 100) or 'full'
  const data = await fetchAlpha({ function: 'TIME_SERIES_DAILY_ADJUSTED', symbol, outputsize });
  const series = data['Time Series (Daily)'];
  if (!series) throw new Error('No historical data');
  const arr = Object.keys(series).map(date => {
    const d = series[date];
    return {
      date,
      open: parseFloat(d['1. open']),
      high: parseFloat(d['2. high']),
      low: parseFloat(d['3. low']),
      close: parseFloat(d['4. close']),
      adjustedClose: parseFloat(d['5. adjusted close']),
      volume: parseInt(d['6. volume'], 10),
    };
  });
  // sort ascending
  arr.sort((a,b) => new Date(a.date) - new Date(b.date));
  return arr;
}

/** Get company overview (fundamentals) */
async function getOverview(symbol) {
  const data = await fetchAlpha({ function: 'OVERVIEW', symbol });
  if (!data || Object.keys(data).length === 0) throw new Error('No overview data');
  return {
    symbol: data.Symbol,
    name: data.Name,
    description: data.Description,
    sector: data.Sector,
    industry: data.Industry,
    marketCap: data.MarketCapitalization ? Number(data.MarketCapitalization) : null,
    peRatio: data.PERatio ? Number(data.PERatio) : null,
    eps: data.EPS ? Number(data.EPS) : null,
    dividendYield: data.DividendYield ? Number(data.DividendYield) : null,
    beta: data.Beta ? Number(data.Beta) : null,
    url: data.Website || null,
  };
}

/** Technical indicators (simple implementations) */

/** Simple Moving Average */
function sma(values, period) {
  if (values.length < period) return [];
  const out = [];
  for (let i = 0; i <= values.length - period; i++) {
    const slice = values.slice(i, i + period);
    const avg = slice.reduce((s,v) => s + v, 0) / period;
    out.push({ index: i + period - 1, value: avg });
  }
  return out;
}

/** Exponential Moving Average */
function ema(values, period) {
  const k = 2 / (period + 1);
  const out = [];
  let prev;
  for (let i = 0; i < values.length; i++) {
    if (i < period - 1) {
      continue;
    } else if (i === period - 1) {
      // start with SMA
      const slice = values.slice(0, period);
      prev = slice.reduce((s,v)=>s+v,0)/period;
      out.push({ index: i, value: prev });
    } else {
      const v = values[i] * k + prev * (1 - k);
      prev = v;
      out.push({ index: i, value: v });
    }
  }
  return out;
}

/** RSI */
function rsi(values, period=14) {
  if (values.length <= period) return [];
  const changes = [];
  for (let i = 1; i < values.length; i++) changes.push(values[i] - values[i-1]);
  let gains = 0, losses = 0;
  for (let i = 0; i < period; i++) {
    const c = changes[i];
    if (c >= 0) gains += c; else losses += Math.abs(c);
  }
  let avgGain = gains / period;
  let avgLoss = losses / period;
  const out = [{ index: period, value: avgLoss === 0 ? 100 : 100 - (100/(1 + avgGain/avgLoss)) }];
  for (let i = period; i < changes.length; i++) {
    const c = changes[i];
    avgGain = (avgGain * (period - 1) + (c > 0 ? c : 0)) / period;
    avgLoss = (avgLoss * (period - 1) + (c < 0 ? Math.abs(c) : 0)) / period;
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const r = avgLoss === 0 ? 100 : 100 - (100 / (1 + rs));
    out.push({ index: i + 1, value: r });
  }
  return out;
}

/** MACD (12/26) */
function macd(values, fast=12, slow=26, signal=9) {
  const emaFast = ema(values, fast);
  const emaSlow = ema(values, slow);
  // ema arrays indexes refer to absolute index in original values
  const macdLine = [];
  const emaSlowMap = new Map(emaSlow.map(e=>[e.index, e.value]));
  emaFast.forEach(f => {
    const sVal = emaSlowMap.get(f.index);
    if (sVal !== undefined) {
      macdLine.push({ index: f.index, value: f.value - sVal });
    }
  });
  // build signal line (EMA of macdLine values)
  const macdValues = macdLine.map(m => m.value);
  const signalLine = ema(macdValues, signal); // returns objects with index relative to macdValues indexes
  // map signalLine back to original indexes
  const outSignal = [];
  for (let i = 0; i < signalLine.length; i++) {
    const sig = signalLine[i];
    const macdIndex = macdLine[sig.index].index;
    outSignal.push({ index: macdIndex, value: sig.value });
  }
  return { macdLine, signalLine: outSignal };
}

/** AI Insight heuristic */
function analyzeTrend(prices) {
  // simple heuristics: slope of last 20, rsi of last 14
  const len = prices.length;
  const last20 = prices.slice(Math.max(0, len - 20));
  const slope = (last20[last20.length - 1] - last20[0]) / last20[0];
  const r = rsi(prices, 14);
  const lastRsi = r.length ? r[r.length - 1].value : 50;
  let recommendation = 'HOLD';
  if (slope > 0.05 && lastRsi < 70) recommendation = 'BUY';
  if (slope < -0.05 || lastRsi > 80) recommendation = 'SELL';
  return { slope, lastRsi, recommendation };
}

module.exports = {
  getQuote,
  getDailyHistory,
  getOverview,
  sma,
  ema,
  rsi,
  macd,
  analyzeTrend
};
