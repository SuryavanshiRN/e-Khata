import { PieChart, Pie, Tooltip, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const PortfolioPieChart = ({ data }) => {
  return (
    <PieChart width={350} height={300}>
      <Pie
        data={data}
        dataKey="value"
        nameKey="symbol"
        cx="50%"
        cy="50%"
        outerRadius={110}
        label
      >
        {data.map((_, index) => (
          <Cell key={index} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip />
    </PieChart>
  );
};

export default PortfolioPieChart;
