import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { adminService } from '../../services/adminService';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    adminService
      .getSettings()
      .then((res) => reset(res.data.settings))
      .finally(() => setLoading(false));
  }, [reset]);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const res = await adminService.updateSettings({
        ...data,
        negativeAlertThreshold: Number(data.negativeAlertThreshold),
        maintenanceMode: !!data.maintenanceMode,
        allowCitizenRegistration: !!data.allowCitizenRegistration,
      });
      reset(res.data.settings);
      toast.success('Settings saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">System Settings</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-6">Platform-wide configuration.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="glass-card p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Site Name</label>
          <input {...register('siteName')} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Support Email</label>
          <input {...register('supportEmail')} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Negative Feedback Alert Threshold (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            {...register('negativeAlertThreshold')}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
          />
          <p className="text-xs text-slate-500 mt-1">Used by the n8n negative-feedback-alert workflow.</p>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
          <input type="checkbox" {...register('allowCitizenRegistration')} className="rounded" />
          Allow new citizen registrations
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
          <input type="checkbox" {...register('maintenanceMode')} className="rounded" />
          Maintenance mode
        </label>

        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}
