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
import { FaBriefcase } from 'react-icons/fa';
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
    <div className="min-h-screen p-6 bg-gray-100 text-gray-900 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 dark:text-white">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
        <FaBriefcase className="text-cyan-400" />
        Portfolio
      </h1>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          ['Invested', summary.invested],
          ['Current', summary.current],
          ['P / L', summary.profitLoss],
          ['P / L %', summary.profitLossPercent + '%'],
        ].map(([label, value], i) => (
          <div
            key={i}
            className="glass p-4 rounded-xl bg-white text-gray-900 dark:bg-white/10 dark:text-white"
          >
            <p className="text-gray-400">{label}</p>
            <p className="text-xl font-bold">${value}</p>
          </div>
        ))}
      </div>

      {/* Add Stock */}
      <div className="glass p-5 rounded-xl mb-6 flex gap-3 flex-wrap bg-white dark:bg-white/10">
        <input
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          placeholder="AAPL"
          className="p-2 rounded w-24 bg-white border border-gray-300 text-gray-900 dark:bg-slate-800 dark:border-white/10 dark:text-white"
        />
        <input
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Qty"
          type="number"
          className="p-2 rounded w-24 bg-white border border-gray-300 text-gray-900 dark:bg-slate-800 dark:border-white/10 dark:text-white"
        />
        <input
          value={buyPrice}
          onChange={(e) => setBuyPrice(e.target.value)}
          placeholder="Buy Price"
          type="number"
          className="p-2 rounded w-24 bg-white border border-gray-300 text-gray-900 dark:bg-slate-800 dark:border-white/10 dark:text-white"
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
      <div className="glass p-6 rounded-xl mb-6 overflow-x-auto bg-white dark:bg-white/10">
        <table className="w-full">
          <thead className="text-gray-600 dark:text-gray-400">
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
                <tr
                  key={s._id}
                  className="border-t border-gray-200 dark:border-white/10"
                >
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
        <div className="glass p-6 rounded-xl bg-white dark:bg-white/10">
          <Line data={chartData} />
        </div>
      )}
    </div>
  );
};

export default Portfolio;
