import { useState } from 'react';
import { FaChartLine } from 'react-icons/fa';
import { fetchStock } from '../api';

export default function StockAnalyzer() {
  const [symbol, setSymbol] = useState('');
  const [stock, setStock] = useState(null);

  const search = async () => {
    try {
      const { data } = await fetchStock(symbol);
      setStock(data);
    } catch {
      alert('Failed to fetch stock data');
    }
  };

  return (
    <div className="card">
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <FaChartLine />
        Stock Market Analyzer
      </h2>

      <input
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)}
        placeholder="AAPL"
      />

      <button onClick={search}>Search</button>

      {stock && (
        <div>
          <h3>{stock.symbol}</h3>
          <p>Current: ${stock.currentPrice}</p>
          <p>High: ${stock.high}</p>
          <p>Low: ${stock.low}</p>
        </div>
      )}
    </div>
  );
}
