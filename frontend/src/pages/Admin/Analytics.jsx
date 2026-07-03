import { useEffect, useState } from 'react';
import { dashboardService } from '../../services/dashboardService';
import SentimentPieChart from '../../components/Charts/SentimentPieChart';
import DepartmentBarChart from '../../components/Charts/DepartmentBarChart';
import MonthlyTrendLineChart from '../../components/Charts/MonthlyTrendLineChart';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

export default function Analytics() {
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService
      .getCharts()
      .then((res) => setCharts(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !charts) return <LoadingSpinner fullScreen />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Analytics</h1>
        <p className="text-slate-500 dark:text-slate-400">Sentiment trends across the entire platform.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-5">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Sentiment Distribution</h3>
          <SentimentPieChart data={charts.pie} />
        </div>
        <div className="glass-card p-5">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Department-wise Sentiment</h3>
          <DepartmentBarChart data={charts.bar} />
        </div>
      </div>

      <div className="glass-card p-5">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Monthly Trend</h3>
        <MonthlyTrendLineChart data={charts.line} />
      </div>
    </div>
  );
}
