const PortfolioSummary = ({ summary }) => {
  return (
    <div style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
      <Card title="Invested" value={`$${summary.invested.toFixed(2)}`} />
      <Card title="Current Value" value={`$${summary.current.toFixed(2)}`} />
      <Card
        title="P / L"
        value={`$${summary.pl.toFixed(2)}`}
        color={summary.pl >= 0 ? 'green' : 'red'}
      />
      <Card
        title="P / L %"
        value={`${summary.plPercent.toFixed(2)}%`}
        color={summary.plPercent >= 0 ? 'green' : 'red'}
      />
    </div>
  );
};

const Card = ({ title, value, color }) => (
  <div
    style={{
      flex: 1,
      padding: 20,
      background: '#1e1e1e',
      borderRadius: 12,
      color: color || '#fff',
    }}
  >
    <h4>{title}</h4>
    <h2>{value}</h2>
  </div>
);

export default PortfolioSummary;
