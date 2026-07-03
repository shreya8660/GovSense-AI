import { useEffect, useState } from 'react';
import { MessageSquare, ThumbsUp, ThumbsDown, Building2 } from 'lucide-react';
import { dashboardService } from '../../services/dashboardService';
import StatCard from '../../components/Cards/StatCard';
import SentimentPieChart from '../../components/Charts/SentimentPieChart';
import DepartmentBarChart from '../../components/Charts/DepartmentBarChart';
import MonthlyTrendLineChart from '../../components/Charts/MonthlyTrendLineChart';
import FeedbackTable from '../../components/Dashboard/FeedbackTable';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

export default function OfficerDashboard() {
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([dashboardService.getStats(), dashboardService.getCharts()])
      .then(([statsRes, chartsRes]) => {
        setStats(statsRes.data.stats);
        setCharts(chartsRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats || !charts) return <LoadingSpinner fullScreen />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Officer Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400">Real-time sentiment insights across all departments.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Feedback" value={stats.total} icon={MessageSquare} color="primary" />
        <StatCard label="Positive" value={stats.positive} icon={ThumbsUp} color="green" />
        <StatCard label="Negative" value={stats.negative} icon={ThumbsDown} color="red" />
        <StatCard label="Departments" value={stats.departmentCount} icon={Building2} color="slate" />
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

      <div>
        <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Recent Feedback</h3>
        <FeedbackTable />
      </div>
    </div>
  );
}
