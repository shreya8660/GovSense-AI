import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { Mic, MicOff, Paperclip, MapPin, Send, Sparkles } from 'lucide-react';
import { lookupService } from '../../services/lookupService';
import { feedbackService } from '../../services/feedbackService';
import { useVoiceInput } from '../../hooks/useVoiceInput';
import StarRating from './StarRating';

export default function FeedbackForm() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [aiPreview, setAiPreview] = useState(null);
  const { isSupported, isListening, transcript, start, stop } = useVoiceInput();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm({ defaultValues: { rating: 0 } });

  useEffect(() => {
    lookupService.getDepartments({ activeOnly: true }).then((res) => setDepartments(res.data.departments));
    lookupService.getCategories({ activeOnly: true }).then((res) => setCategories(res.data.categories));
  }, []);

  useEffect(() => {
    if (transcript) setValue('description', transcript);
  }, [transcript, setValue]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    setAiPreview(null);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') formData.append(key, value);
      });
      formData.set('inputMode', transcript ? 'voice' : 'text');
      if (file) formData.append('attachment', file);

      const res = await feedbackService.create(formData);
      setAiPreview(res.data.feedback.ai);
      toast.success('Feedback submitted and analyzed!');
      setTimeout(() => navigate('/citizen/my-feedback'), 1800);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Submit Feedback</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-6">Your feedback is analyzed by AI the moment you submit it.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="glass-card p-6 sm:p-8 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Policy Name</label>
            <input
              {...register('policyName', { required: 'Policy name is required' })}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="e.g. National Water Conservation Policy"
            />
            {errors.policyName && <p className="text-xs text-red-500 mt-1">{errors.policyName.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Department</label>
            <select
              {...register('department', { required: 'Department is required' })}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select department</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
            {errors.department && <p className="text-xs text-red-500 mt-1">{errors.department.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
            <select
              {...register('category', { required: 'Category is required' })}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Location</label>
            <div className="relative">
              <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                {...register('location')}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="City / District"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Feedback Title</label>
          <input
            {...register('title', { required: 'Title is required' })}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="A short summary of your feedback"
          />
          {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Feedback Description</label>
            {isSupported && (
              <button
                type="button"
                onClick={isListening ? stop : start}
                className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${
                  isListening
                    ? 'bg-red-100 text-red-600 dark:bg-red-900/40'
                    : 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-400'
                }`}
              >
                {isListening ? <MicOff size={12} /> : <Mic size={12} />}
                {isListening ? 'Stop' : 'Voice Input'}
              </button>
            )}
          </div>
          <textarea
            {...register('description', {
              required: 'Description is required',
              minLength: { value: 10, message: 'Please add a bit more detail' },
            })}
            rows={5}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Describe your feedback in detail..."
          />
          {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-start">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Rating</label>
            <Controller
              name="rating"
              control={control}
              rules={{ validate: (v) => v > 0 || 'Please choose a rating' }}
              render={({ field }) => <StarRating value={field.value} onChange={field.onChange} />}
            />
            {errors.rating && <p className="text-xs text-red-500 mt-1">{errors.rating.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Attachment (optional)</label>
            <label className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 cursor-pointer text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800">
              <Paperclip size={16} />
              {file ? file.name : 'Attach image, PDF, or document'}
              <input
                type="file"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx"
              />
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 disabled:opacity-60 transition-colors"
        >
          {submitting ? (
            'Analyzing with AI...'
          ) : (
            <>
              Submit Feedback <Send size={16} />
            </>
          )}
        </button>
      </form>

      {aiPreview && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 mt-6">
          <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-semibold mb-3">
            <Sparkles size={16} /> AI Analysis Complete
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-slate-500 dark:text-slate-400 text-xs mb-1">Sentiment</div>
              <div className="font-semibold capitalize">{aiPreview.sentiment.label}</div>
            </div>
            <div>
              <div className="text-slate-500 dark:text-slate-400 text-xs mb-1">Confidence</div>
              <div className="font-semibold">{Math.round(aiPreview.sentiment.confidenceScore * 100)}%</div>
            </div>
            <div>
              <div className="text-slate-500 dark:text-slate-400 text-xs mb-1">Emotion</div>
              <div className="font-semibold capitalize">{aiPreview.emotion}</div>
            </div>
            <div>
              <div className="text-slate-500 dark:text-slate-400 text-xs mb-1">Keywords</div>
              <div className="font-semibold">{aiPreview.keywords?.slice(0, 3).join(', ')}</div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
