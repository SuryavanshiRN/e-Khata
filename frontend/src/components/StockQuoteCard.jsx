import React from "react";

const StockQuoteCard = ({ quote }) => {
  const isUp = quote.change >= 0;

  return (
    <div className="mt-4 p-5 bg-white shadow rounded-2xl">
      <h2 className="text-2xl font-bold mb-2">{quote.symbol}</h2>

      <p className="text-4xl font-semibold">${quote.price.toFixed(2)}</p>

      <p className={`mt-2 font-medium ${isUp ? "text-green-600" : "text-red-600"}`}>
        {isUp ? "▲" : "▼"} {quote.change} ({quote.changePercent})
      </p>

      <p className="mt-2 text-gray-600">Volume: {quote.volume.toLocaleString()}</p>
      <p className="text-gray-500 text-sm">
        Last Trading Day: {quote.latestTradingDay}
      </p>
    </div>
  );
};

export default StockQuoteCard;
