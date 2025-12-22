// frontend/src/components/StockChart.jsx
import React from 'react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, AreaChart, Area
} from 'recharts';

export default function StockChart({ data, indicatorSeries = {} }) {
  // data: [{date, open, high, low, close, volume}, ...] ascending by date
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" minTickGap={20} />
        <YAxis domain={['auto','auto']} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="close" stroke="#8884d8" dot={false} name="Close" />
        {indicatorSeries.sma20 && <Line data={indicatorSeries.sma20} dataKey="value" stroke="#82ca9d" dot={false} name="SMA20" />}
        {indicatorSeries.sma50 && <Line data={indicatorSeries.sma50} dataKey="value" stroke="#ffc658" dot={false} name="SMA50" />}
        {indicatorSeries.ema12 && <Line data={indicatorSeries.ema12} dataKey="value" stroke="#ff7300" dot={false} name="EMA12" />}
      </LineChart>
    </ResponsiveContainer>
  );
}
