import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { getPortfolio, addStock, removeStock } from '../api/portfolio';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Portfolio = () => {
  const [stocks, setStocks] = useState([]);
  const [summary, setSummary] = useState({
    invested: 0,
    current: 0,
    profitLoss: 0,
    profitLossPercent: 0,
  });

  const [symbol, setSymbol] = useState('AAPL');
  const [quantity, setQuantity] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [loading, setLoading] = useState(false);

  // 🔹 Load portfolio
  const loadPortfolio = async () => {
    const res = await getPortfolio();
    setStocks(res.data.stocks);
    setSummary(res.data.summary);
  };

  useEffect(() => {
    loadPortfolio();
  }, []);

  // 🔹 Add stock
  const handleAdd = async () => {
    if (!symbol || !quantity || !buyPrice) return;

    setLoading(true);
    await addStock({
      symbol,
      quantity: Number(quantity),
      buyPrice: Number(buyPrice),
    });

    setSymbol('AAPL');
    setQuantity('');
    setBuyPrice('');
    await loadPortfolio();
    setLoading(false);
  };

  // 🔹 Remove stock
  const handleRemove = async (id) => {
    await removeStock(id);
    await loadPortfolio();
  };

  // 🔹 Chart
  const chartData = {
    labels: stocks.map((s) => s.symbol),
    datasets: [
      {
        label: 'Invested',
        data: stocks.map((s) => s.invested),
        borderColor: '#22d3ee',
      },
      {
        label: 'Current Value',
        data: stocks.map((s) => s.currentValue),
        borderColor: '#22c55e',
      },
    ],
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <h1 className="text-3xl font-bold mb-6">💼 My Portfolio</h1>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          ['Invested', summary.invested],
          ['Current', summary.current],
          ['P / L', summary.profitLoss],
          ['P / L %', summary.profitLossPercent + '%'],
        ].map(([label, value], i) => (
          <div key={i} className="glass p-4 rounded-xl">
            <p className="text-gray-400">{label}</p>
            <p className="text-xl font-bold">${value}</p>
          </div>
        ))}
      </div>

      {/* Add Stock */}
      <div className="glass p-5 rounded-xl mb-6 flex gap-3 flex-wrap">
        <input
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          placeholder="AAPL"
          className="bg-slate-800 p-2 rounded w-24"
        />
        <input
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Qty"
          type="number"
          className="bg-slate-800 p-2 rounded w-24"
        />
        <input
          value={buyPrice}
          onChange={(e) => setBuyPrice(e.target.value)}
          placeholder="Buy Price"
          type="number"
          className="bg-slate-800 p-2 rounded w-24"
        />
        <button
          onClick={handleAdd}
          disabled={loading}
          className="bg-cyan-500 px-6 rounded font-semibold hover:bg-cyan-600"
        >
          {loading ? 'Adding...' : 'Add'}
        </button>
      </div>

      {/* Table */}
      <div className="glass p-6 rounded-xl mb-6 overflow-x-auto">
        <table className="w-full">
          <thead className="text-gray-400">
            <tr>
              <th>Stock</th>
              <th>Qty</th>
              <th>Buy</th>
              <th>Current</th>
              <th>P/L</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {stocks.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-4">
                  No stocks added yet.
                </td>
              </tr>
            ) : (
              stocks.map((s) => (
                <tr key={s._id} className="border-t border-white/10">
                  <td>{s.symbol}</td>
                  <td>{s.quantity}</td>
                  <td>${s.buyPrice}</td>
                  <td>${s.currentPrice}</td>
                  <td
                    className={
                      s.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'
                    }
                  >
                    ${s.profitLoss}
                  </td>
                  <td>
                    <button
                      onClick={() => handleRemove(s._id)}
                      className="bg-red-600 px-3 py-1 rounded"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Chart */}
      {stocks.length > 0 && (
        <div className="glass p-6 rounded-xl">
          <Line data={chartData} />
        </div>
      )}
    </div>
  );
};

export default Portfolio;
