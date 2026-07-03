import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { lookupService } from '../../services/lookupService';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import Badge from '../../components/Common/Badge';

export default function ManagePolicies() {
  const [items, setItems] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const { register, handleSubmit, reset, setValue } = useForm();

  useEffect(() => {
    lookupService.getDepartments({ activeOnly: true }).then((res) => setDepartments(res.data.departments));
    lookupService.getCategories({ activeOnly: true }).then((res) => setCategories(res.data.categories));
  }, []);

  const load = () => {
    setLoading(true);
    lookupService
      .getPolicies({ limit: 50 })
      .then((res) => setItems(res.data.items))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const onSubmit = async (data) => {
    try {
      if (editingId) {
        await adminService.updatePolicy(editingId, data);
        toast.success('Policy updated');
      } else {
        await adminService.createPolicy(data);
        toast.success('Policy created');
      }
      reset();
      setEditingId(null);
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
  };

  const startEdit = (p) => {
    setEditingId(p._id);
    setShowForm(true);
    setValue('title', p.title);
    setValue('description', p.description);
    setValue('department', p.department?._id);
    setValue('category', p.category?._id);
    setValue('status', p.status);
  };

  const remove = async (p) => {
    if (!confirm(`Delete policy "${p.title}"?`)) return;
    try {
      await adminService.deletePolicy(p._id);
      toast.success('Policy deleted');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Manage Policies</h1>
          <p className="text-slate-500 dark:text-slate-400">Policies open for citizen e-consultation.</p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700"
        >
          <Plus size={16} /> New Policy
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="glass-card p-5 mb-6 space-y-4">
          <input
            {...register('title', { required: true })}
            placeholder="Policy title"
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
          />
          <textarea
            {...register('description', { required: true })}
            rows={3}
            placeholder="Description"
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <select
              {...register('department', { required: true })}
              className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
            >
              <option value="">Department</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
            <select
              {...register('category')}
              className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
            >
              <option value="">Category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              {...register('status')}
              className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-5 py-2 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700">
              {editingId ? 'Update' : 'Create'} Policy
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                reset();
              }}
              className="px-5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="space-y-3">
          {items.map((p) => (
            <div key={p._id} className="glass-card p-5 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-slate-900 dark:text-white">{p.title}</h3>
                  <Badge value={p.status} />
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 max-w-2xl">{p.description}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {p.department?.name} · {p.feedbackCount} responses
                </p>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button onClick={() => startEdit(p)} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
                  <Edit2 size={14} />
                </button>
                <button onClick={() => remove(p)} className="p-1.5 rounded-lg bg-red-100 text-red-700 dark:bg-red-900/40">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="text-center text-slate-400 py-12">No policies yet.</p>}
        </div>
      )}
    </div>
  );
}
