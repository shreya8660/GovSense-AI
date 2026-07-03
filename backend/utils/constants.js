// Centralized enums so controllers, models, and the AI service all agree
// on the same set of valid values.

export const USER_ROLES = {
  CITIZEN: 'citizen',
  OFFICER: 'officer',
  ADMIN: 'admin',
};

export const LANGUAGES = ['en', 'hi', 'kn', 'ta']; // English, Hindi, Kannada, Tamil

export const SENTIMENT_LABELS = ['positive', 'negative', 'neutral'];

export const EMOTIONS = ['happy', 'angry', 'sad', 'concerned', 'satisfied'];

export const FEEDBACK_STATUS = ['pending', 'approved', 'rejected'];

export const AI_PROVIDERS = ['gemini', 'huggingface'];

export const POLICY_STATUS = ['draft', 'active', 'closed'];

export const REPORT_TYPES = ['weekly', 'monthly', 'custom'];

export const REPORT_FORMATS = ['pdf', 'excel', 'csv'];

export const NOTIFICATION_TYPES = [
  'feedback_submitted',
  'feedback_approved',
  'feedback_rejected',
  'weekly_report',
  'negative_alert',
  'monthly_report',
  'system',
];

export const NEGATIVE_ALERT_THRESHOLD_DEFAULT = 40; // percent, overridable via env
