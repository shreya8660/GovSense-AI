import { useEffect, useState } from 'react';
import { Users, Briefcase, Building2, MessageSquare, Clock, AlertTriangle } from 'lucide-react';
import { adminService } from '../../services/adminService';
import StatCard from '../../components/Cards/StatCard';
import MonthlyTrendLineChart from '../../components/Charts/MonthlyTrendLineChart';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService
      .getAnalytics()
      .then((res) => setAnalytics(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !analytics) return <LoadingSpinner fullScreen />;

  const growthData = analytics.userGrowth.map((g) => ({ month: g.month, total: g.count }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Admin Overview</h1>
        <p className="text-slate-500 dark:text-slate-400">Platform-wide statistics at a glance.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Citizens" value={analytics.userCount} icon={Users} color="primary" />
        <StatCard label="Officers" value={analytics.officerCount} icon={Briefcase} color="slate" />
        <StatCard label="Departments" value={analytics.departmentCount} icon={Building2} color="slate" />
        <StatCard label="Total Feedback" value={analytics.feedbackCount} icon={MessageSquare} color="primary" />
        <StatCard label="Pending Officer Approvals" value={analytics.pendingOfficers} icon={Clock} color="red" />
        <StatCard label="Pending Feedback" value={analytics.pendingFeedback} icon={AlertTriangle} color="red" />
      </div>

      <div className="glass-card p-5">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Citizen Growth (last 6 months)</h3>
        <MonthlyTrendLineChart data={growthData} />
      </div>
    </div>
  );
}
