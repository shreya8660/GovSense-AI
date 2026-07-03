import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Plus, Trash2, Edit2, Building2 } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { lookupService } from '../../services/lookupService';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

export default function ManageDepartments() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const { register, handleSubmit, reset, setValue } = useForm();

  const load = () => {
    setLoading(true);
    lookupService
      .getDepartments()
      .then((res) => setItems(res.data.departments))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const onSubmit = async (data) => {
    try {
      if (editingId) {
        await adminService.updateDepartment(editingId, data);
        toast.success('Department updated');
      } else {
        await adminService.createDepartment(data);
        toast.success('Department created');
      }
      reset();
      setEditingId(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
  };

  const startEdit = (d) => {
    setEditingId(d._id);
    setValue('name', d.name);
    setValue('code', d.code);
    setValue('description', d.description);
    setValue('contactEmail', d.contactEmail);
  };

  const remove = async (d) => {
    if (!confirm(`Delete department "${d.name}"?`)) return;
    try {
      await adminService.deleteDepartment(d._id);
      toast.success('Department deleted');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Manage Departments</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-6">Government departments used across feedback and policies.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="glass-card p-5 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          {...register('name', { required: true })}
          placeholder="Department name"
          className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
        />
        <input
          {...register('code', { required: true })}
          placeholder="Code (e.g. MOH)"
          className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
        />
        <input
          {...register('contactEmail')}
          placeholder="Contact email"
          className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
        />
        <input
          {...register('description')}
          placeholder="Description"
          className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
        />
        <div className="sm:col-span-2 flex gap-2">
          <button type="submit" className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700">
            <Plus size={14} /> {editingId ? 'Update' : 'Add'} Department
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
          {items.map((d) => (
            <div key={d._id} className="glass-card p-5">
              <div className="flex items-start justify-between mb-2">
                <div className="w-9 h-9 rounded-lg bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-600 dark:text-primary-400">
                  <Building2 size={16} />
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => startEdit(d)} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
                    <Edit2 size={13} />
                  </button>
                  <button onClick={() => remove(d)} className="p-1.5 rounded-lg bg-red-100 text-red-700 dark:bg-red-900/40">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white">{d.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{d.code}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">{d.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
