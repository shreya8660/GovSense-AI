import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function MonthlyTrendLineChart({ data }) {
  if (!data?.length) return <div className="text-sm text-slate-400 py-12 text-center">No data yet</div>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={2} />
        <Line type="monotone" dataKey="positive" stroke="#16a34a" strokeWidth={2} />
        <Line type="monotone" dataKey="negative" stroke="#dc2626" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}
