import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function DepartmentBarChart({ data }) {
  if (!data?.length) return <div className="text-sm text-slate-400 py-12 text-center">No data yet</div>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
        <XAxis dataKey="department" tick={{ fontSize: 12 }} interval={0} angle={-15} textAnchor="end" height={60} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Legend />
        <Bar dataKey="positive" fill="#16a34a" radius={[4, 4, 0, 0]} />
        <Bar dataKey="negative" fill="#dc2626" radius={[4, 4, 0, 0]} />
        <Bar dataKey="neutral" fill="#64748b" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
