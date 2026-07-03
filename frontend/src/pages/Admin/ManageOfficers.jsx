import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Search, Check, X, Trash2, UserPlus } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { lookupService } from '../../services/lookupService';
import Pagination from '../../components/Common/Pagination';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import Badge from '../../components/Common/Badge';

export default function ManageOfficers() {
  const [items, setItems] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    lookupService.getDepartments({ activeOnly: true }).then((res) => setDepartments(res.data.departments));
  }, []);

  const load = () => {
    setLoading(true);
    adminService
      .getOfficers({ search, page, limit: 10 })
      .then((res) => {
        setItems(res.data.items);
        setTotalPages(res.meta.totalPages);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, page]);

  const onCreate = async (data) => {
    try {
      await adminService.createOfficer(data);
      toast.success('Officer account created');
      reset();
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Creation failed');
    }
  };

  const approve = async (id, value) => {
    try {
      await adminService.approveOfficer(id, value);
      toast.success(value ? 'Officer approved' : 'Approval revoked');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const remove = async (o) => {
    if (!confirm(`Delete officer ${o.name}?`)) return;
    try {
      await adminService.deleteOfficer(o._id);
      toast.success('Officer deleted');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Manage Officers</h1>
          <p className="text-slate-500 dark:text-slate-400">Government officer accounts by department.</p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700"
        >
          <UserPlus size={16} /> New Officer
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onCreate)} className="glass-card p-5 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name</label>
            <input
              {...register('name', { required: true })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
            <input
              type="email"
              {...register('email', { required: true })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Temporary Password</label>
            <input
              type="password"
              {...register('password', { required: true, minLength: 8 })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Department</label>
            <select
              {...register('department', { required: true })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
            >
              <option value="">Select department</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Designation</label>
            <input
              {...register('designation')}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Employee ID</label>
            <input
              {...register('employeeId')}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className="px-5 py-2 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700">
              Create Officer
            </button>
          </div>
        </form>
      )}

      <div className="glass-card p-5">
        <div className="relative mb-4 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            placeholder="Search officers..."
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
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Department</th>
                  <th className="py-2 pr-4">Approval</th>
                  <th className="py-2 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((o) => (
                  <tr key={o._id} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="py-3 pr-4 font-medium text-slate-900 dark:text-white">{o.name}</td>
                    <td className="py-3 pr-4 text-slate-600 dark:text-slate-400">{o.email}</td>
                    <td className="py-3 pr-4 text-slate-600 dark:text-slate-400">{o.department?.name}</td>
                    <td className="py-3 pr-4">
                      <Badge value={o.isApproved ? 'approved' : 'pending'} />
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex gap-1.5">
                        {!o.isApproved ? (
                          <button
                            onClick={() => approve(o._id, true)}
                            className="p-1.5 rounded-lg bg-green-100 text-green-700 dark:bg-green-900/40"
                            title="Approve"
                          >
                            <Check size={14} />
                          </button>
                        ) : (
                          <button
                            onClick={() => approve(o._id, false)}
                            className="p-1.5 rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-900/40"
                            title="Revoke approval"
                          >
                            <X size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => remove(o)}
                          className="p-1.5 rounded-lg bg-red-100 text-red-700 dark:bg-red-900/40"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No officers found
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
