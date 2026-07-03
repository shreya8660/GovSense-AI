import { motion } from 'framer-motion';
import { Building2, Tag, Calendar, Star } from 'lucide-react';
import Badge from '../Common/Badge';

export default function FeedbackCard({ feedback, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="glass-card p-5"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="font-semibold text-slate-900 dark:text-white">{feedback.title}</h3>
        <div className="flex gap-1.5 shrink-0">
          <Badge value={feedback.ai?.sentiment?.label} />
          <Badge value={feedback.status} />
        </div>
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">{feedback.description}</p>
      {feedback.ai?.summary && (
        <p className="text-xs italic text-slate-500 dark:text-slate-500 mb-3">"{feedback.ai.summary}"</p>
      )}
      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1">
          <Building2 size={12} /> {feedback.department?.name}
        </span>
        <span className="flex items-center gap-1">
          <Tag size={12} /> {feedback.category?.name}
        </span>
        <span className="flex items-center gap-1">
          <Star size={12} className="fill-amber-400 text-amber-400" /> {feedback.rating}/5
        </span>
        <span className="flex items-center gap-1">
          <Calendar size={12} /> {new Date(feedback.createdAt).toLocaleDateString()}
        </span>
      </div>
    </motion.div>
  );
}
