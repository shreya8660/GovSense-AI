import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Building2, Calendar } from 'lucide-react';
import { lookupService } from '../../services/lookupService';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import Pagination from '../../components/Common/Pagination';
import Badge from '../../components/Common/Badge';

export default function Policies() {
  const [policies, setPolicies] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    lookupService.getDepartments({ activeOnly: true }).then((res) => setDepartments(res.data.departments));
  }, []);

  useEffect(() => {
    setLoading(true);
    lookupService
      .getPolicies({ search, department, page, limit: 9 })
      .then((res) => {
        setPolicies(res.data.items);
        setTotalPages(res.meta.totalPages);
      })
      .finally(() => setLoading(false));
  }, [search, department, page]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Open for Consultation</h1>
      <p className="text-slate-600 dark:text-slate-400 mb-8">Browse government policies and share your feedback.</p>

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            placeholder="Search policies..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <select
          value={department}
          onChange={(e) => {
            setPage(1);
            setDepartment(e.target.value);
          }}
          className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d._id} value={d._id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : policies.length === 0 ? (
        <p className="text-center text-slate-500 dark:text-slate-400 py-12">No policies found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {policies.map((p, i) => (
            <motion.div
              key={p._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="glass-card p-6 flex flex-col"
            >
              <div className="flex items-center justify-between mb-3">
                <Badge value={p.status} />
                <span className="text-xs text-slate-400">{p.feedbackCount} responses</span>
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{p.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 mb-4 flex-1">{p.description}</p>
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Building2 size={12} /> {p.department?.name}
                </span>
                {p.consultationEndDate && (
                  <span className="flex items-center gap-1">
                    <Calendar size={12} /> Closes {new Date(p.consultationEndDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
