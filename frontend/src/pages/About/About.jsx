import { Target, Users, Lightbulb } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">About GovSense AI</h1>
      <p className="text-slate-600 dark:text-slate-400 text-lg mb-10">
        GovSense AI is a government e-consultation platform that uses artificial intelligence to
        understand what citizens are actually saying about public policy - at scale, in real time.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
        <div className="glass-card p-6">
          <Target className="text-primary-600 dark:text-primary-400 mb-3" size={22} />
          <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Our Mission</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Make it effortless for citizens to be heard, and for governments to listen at scale.
          </p>
        </div>
        <div className="glass-card p-6">
          <Users className="text-primary-600 dark:text-primary-400 mb-3" size={22} />
          <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Who It's For</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Citizens, government officers, and policy administrators - one platform, three views.
          </p>
        </div>
        <div className="glass-card p-6">
          <Lightbulb className="text-primary-600 dark:text-primary-400 mb-3" size={22} />
          <h3 className="font-semibold text-slate-900 dark:text-white mb-1">How AI Helps</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Sentiment, emotion, keyword, and summary extraction on every submission - instantly.
          </p>
        </div>
      </div>

      <div className="text-slate-600 dark:text-slate-400 space-y-4">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Why sentiment analysis?</h2>
        <p>
          Traditional public consultation produces mountains of unstructured feedback that's slow and
          expensive to review manually. GovSense AI applies large language models to every submission,
          surfacing sentiment trends, emerging concerns, and department-level hotspots automatically -
          so officers can act on what matters most, faster.
        </p>
      </div>
    </div>
  );
}
