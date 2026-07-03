import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Search, Check, X, Download, FileSpreadsheet } from 'lucide-react';
import { feedbackService } from '../../services/feedbackService';
import { reportService } from '../../services/reportService';
import { lookupService } from '../../services/lookupService';
import Badge from '../Common/Badge';
import Pagination from '../Common/Pagination';
import LoadingSpinner from '../Common/LoadingSpinner';

export default function FeedbackTable() {
  const [items, setItems] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sentiment, setSentiment] = useState('');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    lookupService.getDepartments({ activeOnly: true }).then((res) => setDepartments(res.data.departments));
  }, []);

  const loadData = () => {
    setLoading(true);
    feedbackService
      .getAll({ search, sentiment, department, status, page, limit: 10 })
      .then((res) => {
        setItems(res.data.items);
        setTotalPages(res.meta.totalPages);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, sentiment, department, status, page]);

  const handleApprove = async (id, decision) => {
    try {
      await feedbackService.approve(id, decision);
      toast.success(`Feedback ${decision}`);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  return (
    <div className="glass-card p-5">
      <div className="flex flex-col lg:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            placeholder="Search feedback..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <select
          value={department}
          onChange={(e) => {
            setPage(1);
            setDepartment(e.target.value);
          }}
          className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d._id} value={d._id}>
              {d.name}
            </option>
          ))}
        </select>
        <select
          value={sentiment}
          onChange={(e) => {
            setPage(1);
            setSentiment(e.target.value);
          }}
          className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
        >
          <option value="">All Sentiments</option>
          <option value="positive">Positive</option>
          <option value="negative">Negative</option>
          <option value="neutral">Neutral</option>
        </select>
        <select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
          className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <div className="flex gap-2">
          <button
            onClick={() => reportService.downloadPdf({ department })}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Download size={14} /> PDF
          </button>
          <button
            onClick={() => reportService.downloadExcel({ department })}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <FileSpreadsheet size={14} /> Excel
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <th className="py-2 pr-4">Title</th>
                <th className="py-2 pr-4">Citizen</th>
                <th className="py-2 pr-4">Department</th>
                <th className="py-2 pr-4">Sentiment</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((f) => (
                <tr key={f._id} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-3 pr-4 font-medium text-slate-900 dark:text-white max-w-[220px] truncate">{f.title}</td>
                  <td className="py-3 pr-4 text-slate-600 dark:text-slate-400">{f.citizen?.name}</td>
                  <td className="py-3 pr-4 text-slate-600 dark:text-slate-400">{f.department?.name}</td>
                  <td className="py-3 pr-4">
                    <Badge value={f.ai?.sentiment?.label} />
                  </td>
                  <td className="py-3 pr-4">
                    <Badge value={f.status} />
                  </td>
                  <td className="py-3 pr-4 text-slate-500 dark:text-slate-500">
                    {new Date(f.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 pr-4">
                    {f.status === 'pending' && (
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleApprove(f._id, 'approved')}
                          className="p-1.5 rounded-lg bg-green-100 text-green-700 dark:bg-green-900/40 hover:opacity-80"
                          aria-label="Approve"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={() => handleApprove(f._id, 'rejected')}
                          className="p-1.5 rounded-lg bg-red-100 text-red-700 dark:bg-red-900/40 hover:opacity-80"
                          aria-label="Reject"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No feedback found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
