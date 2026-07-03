const VARIANTS = {
  positive: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  negative: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
  neutral: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  approved: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
  default: 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-400',
};

export default function Badge({ value, className = '' }) {
  const variant = VARIANTS[value] || VARIANTS.default;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${variant} ${className}`}>
      {value || 'unknown'}
    </span>
  );
}
