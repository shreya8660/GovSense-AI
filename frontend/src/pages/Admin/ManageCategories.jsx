import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Plus, Trash2, Edit2, Tag } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { lookupService } from '../../services/lookupService';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

export default function ManageCategories() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const { register, handleSubmit, reset, setValue } = useForm();

  const load = () => {
    setLoading(true);
    lookupService
      .getCategories()
      .then((res) => setItems(res.data.categories))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const onSubmit = async (data) => {
    try {
      if (editingId) {
        await adminService.updateCategory(editingId, data);
        toast.success('Category updated');
      } else {
        await adminService.createCategory(data);
        toast.success('Category created');
      }
      reset();
      setEditingId(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
  };

  const startEdit = (c) => {
    setEditingId(c._id);
    setValue('name', c.name);
    setValue('description', c.description);
  };

  const remove = async (c) => {
    if (!confirm(`Delete category "${c.name}"?`)) return;
    try {
      await adminService.deleteCategory(c._id);
      toast.success('Category deleted');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Manage Categories</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-6">Feedback categories citizens choose from.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="glass-card p-5 mb-6 flex flex-col sm:flex-row gap-4">
        <input
          {...register('name', { required: true })}
          placeholder="Category name"
          className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
        />
        <input
          {...register('description')}
          placeholder="Description (optional)"
          className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
        />
        <div className="flex gap-2">
          <button type="submit" className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700">
            <Plus size={14} /> {editingId ? 'Update' : 'Add'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                reset();
              }}
              className="px-5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((c) => (
            <div key={c._id} className="glass-card p-5 flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-accent-500/10 flex items-center justify-center text-accent-600 dark:text-accent-400 shrink-0">
                  <Tag size={16} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{c.name}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{c.description}</p>
                </div>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button onClick={() => startEdit(c)} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
                  <Edit2 size={13} />
                </button>
                <button onClick={() => remove(c)} className="p-1.5 rounded-lg bg-red-100 text-red-700 dark:bg-red-900/40">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
