import { useState } from 'react';
import { fetchStock } from '../api';

export default function StockSearch() {
  const [symbol, setSymbol] = useState('');
  const [stock, setStock] = useState(null);

  const search = async () => {
    try {
      const { data } = await fetchStock(symbol);
      setStock(data);
    } catch {
      alert('Invalid stock symbol');
    }
  };

  return (
    <div className="card">
      <h2>📈 Stock Market Analyzer</h2>
      <input value={symbol} onChange={e => setSymbol(e.target.value)} />
      <button onClick={search}>Search</button>

      {stock && (
        <div>
          <h3>{stock.symbol}</h3>
          <p>${stock.price}</p>
        </div>
      )}
    </div>
  );
}
