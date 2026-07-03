import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 font-bold text-lg text-white mb-3">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center text-white text-sm">
              G
            </span>
            GovSense AI
          </div>
          <p className="text-sm text-slate-400">
            AI-powered government e-consultation and sentiment analysis platform.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-primary-400">{t('nav.home')}</Link></li>
            <li><Link to="/about" className="hover:text-primary-400">{t('nav.about')}</Link></li>
            <li><Link to="/policies" className="hover:text-primary-400">{t('nav.policies')}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-3">Account</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/login" className="hover:text-primary-400">{t('nav.login')}</Link></li>
            <li><Link to="/register" className="hover:text-primary-400">{t('nav.register')}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-3">Contact</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2"><Mail size={14} /> support@govsense.ai</li>
            <li className="flex items-center gap-2"><Phone size={14} /> +91 1800-000-000</li>
            <li className="flex items-center gap-2"><MapPin size={14} /> New Delhi, India</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">
        © {year} GovSense AI. Built for demonstration purposes.
      </div>
    </footer>
  );
}
