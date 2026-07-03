import { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import { feedbackService } from '../../services/feedbackService';
import FeedbackCard from '../../components/Feedback/FeedbackCard';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import Pagination from '../../components/Common/Pagination';

export default function MyFeedback() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    feedbackService
      .getMine({ page, limit: 8 })
      .then((res) => {
        setItems(res.data.items);
        setTotalPages(res.meta.totalPages);
      })
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">My Feedback</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-6">Track every submission and its AI-detected sentiment.</p>

      {loading ? (
        <LoadingSpinner />
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-slate-500 dark:text-slate-400">
          <FileText className="mx-auto mb-3 opacity-40" size={40} />
          You haven't submitted any feedback yet.
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((f, i) => (
            <FeedbackCard key={f._id} feedback={f} index={i} />
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
