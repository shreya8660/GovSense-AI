import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { adminService } from '../../services/adminService';
import Pagination from '../../components/Common/Pagination';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

export default function Logs() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    adminService
      .getLogs({ action, page, limit: 20 })
      .then((res) => {
        setItems(res.data.items);
        setTotalPages(res.meta.totalPages);
      })
      .finally(() => setLoading(false));
  }, [action, page]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Activity Logs</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-6">Audit trail of administrative and officer actions.</p>

      <div className="glass-card p-5">
        <div className="relative mb-4 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={action}
            onChange={(e) => {
              setPage(1);
              setAction(e.target.value);
            }}
            placeholder="Filter by action (e.g. officer.approve)"
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                  <th className="py-2 pr-4">Action</th>
                  <th className="py-2 pr-4">Actor</th>
                  <th className="py-2 pr-4">Target</th>
                  <th className="py-2 pr-4">When</th>
                </tr>
              </thead>
              <tbody>
                {items.map((log) => (
                  <tr key={log._id} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="py-3 pr-4 font-mono text-xs text-primary-700 dark:text-primary-400">{log.action}</td>
                    <td className="py-3 pr-4 text-slate-600 dark:text-slate-400">{log.actorModel}</td>
                    <td className="py-3 pr-4 text-slate-500 text-xs">{log.targetType || '-'}</td>
                    <td className="py-3 pr-4 text-slate-500">{new Date(log.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      No activity yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
}
