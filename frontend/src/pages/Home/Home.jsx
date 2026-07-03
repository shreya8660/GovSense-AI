import { motion } from 'framer-motion';
import { Brain, MessageSquareText, ShieldCheck, BarChart3, Mic, Languages } from 'lucide-react';
import Hero from '../../components/Hero/Hero';

const FEATURES = [
  { icon: Brain, title: 'AI Sentiment Analysis', desc: 'Every submission is automatically analyzed for sentiment, emotion, and key themes.' },
  { icon: MessageSquareText, title: 'Real Citizen Voices', desc: 'Structured feedback forms make it easy to share detailed, actionable input.' },
  { icon: BarChart3, title: 'Live Dashboards', desc: 'Officers see sentiment trends and department breakdowns as they happen.' },
  { icon: ShieldCheck, title: 'Transparent Review', desc: 'Every piece of feedback is reviewed and tracked through to a decision.' },
  { icon: Mic, title: 'Voice Feedback', desc: 'Speak your feedback - our voice-to-text makes participation effortless.' },
  { icon: Languages, title: 'Multilingual', desc: 'Available in English, Hindi, Kannada, and Tamil.' },
];

const STEPS = [
  { step: '01', title: 'Submit Feedback', desc: 'Share your thoughts on any government policy or department.' },
  { step: '02', title: 'AI Analyzes It', desc: 'Our AI detects sentiment, emotion, and extracts key themes instantly.' },
  { step: '03', title: 'Officers Review', desc: 'Government officers see prioritized, categorized feedback on their dashboard.' },
  { step: '04', title: 'Policy Improves', desc: 'Aggregated insights inform better, more responsive governance.' },
];

export default function Home() {
  return (
    <div>
      <Hero />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Built for Real Civic Engagement</h2>
          <p className="mt-3 text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Everything citizens, officers, and administrators need in one platform.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="glass-card p-6"
            >
              <div className="w-11 h-11 rounded-xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-600 dark:text-primary-400 mb-4">
                <f.icon size={20} />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{f.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-slate-900 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white">How It Works</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {STEPS.map((s) => (
              <div key={s.step} className="text-center">
                <div className="text-5xl font-bold text-primary-500/30 mb-2">{s.step}</div>
                <h3 className="font-semibold text-white mb-1">{s.title}</h3>
                <p className="text-sm text-slate-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
