import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { authService } from '../../services/authService';

export default function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState('verifying'); // verifying | success | error

  useEffect(() => {
    authService
      .verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-950 dark:to-slate-900">
      <div className="w-full max-w-md glass-card p-8 text-center">
        {status === 'verifying' && (
          <>
            <Loader2 className="animate-spin mx-auto text-primary-600" size={40} />
            <p className="mt-4 text-slate-600 dark:text-slate-400">Verifying your email...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle2 className="mx-auto text-green-600" size={40} />
            <h1 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">Email verified!</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">Your account is now fully activated.</p>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="mx-auto text-red-600" size={40} />
            <h1 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">Verification failed</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">This link may have expired.</p>
          </>
        )}
        <Link to="/" className="inline-block mt-6 text-primary-600 dark:text-primary-400 font-medium hover:underline">
          Return home
        </Link>
      </div>
    </div>
  );
}
