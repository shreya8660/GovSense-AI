import nodemailer from 'nodemailer';

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: Number(process.env.EMAIL_PORT) === 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return transporter;
};

// Best-effort send - callers should .catch() this rather than let a broken
// SMTP config break the main request (e.g. feedback submission).
export const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️  EMAIL_USER/EMAIL_PASS not configured - skipping email send');
    return null;
  }
  return getTransporter().sendMail({
    from: process.env.EMAIL_FROM || 'GovSense AI <noreply@govsense.ai>',
    to,
    subject,
    html,
  });
};

const wrapper = (title, bodyHtml) => `
<div style="font-family: 'Inter', Arial, sans-serif; max-width: 560px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
  <div style="background: linear-gradient(135deg, #2563eb, #4f46e5); padding: 24px; text-align: center;">
    <h1 style="color: #ffffff; margin: 0; font-size: 22px;">GovSense AI</h1>
  </div>
  <div style="padding: 28px; color: #1e293b; line-height: 1.6;">
    <h2 style="margin-top: 0;">${title}</h2>
    ${bodyHtml}
  </div>
  <div style="padding: 16px; text-align: center; color: #94a3b8; font-size: 12px;">
    Government E-Consultation Sentiment Analysis Platform
  </div>
</div>`;

export const verificationEmailTemplate = (name, verifyUrl) =>
  wrapper(
    'Verify your email',
    `
  <p>Hi ${name},</p>
  <p>Thanks for registering with GovSense AI. Please verify your email address to activate your account.</p>
  <p style="text-align:center; margin: 24px 0;">
    <a href="${verifyUrl}" style="background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;">Verify Email</a>
  </p>
  <p>This link expires in 24 hours.</p>
  `
  );

export const resetPasswordEmailTemplate = (name, resetUrl) =>
  wrapper(
    'Reset your password',
    `
  <p>Hi ${name},</p>
  <p>We received a request to reset your password. Click the button below to choose a new one.</p>
  <p style="text-align:center; margin: 24px 0;">
    <a href="${resetUrl}" style="background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;">Reset Password</a>
  </p>
  <p>This link expires in 15 minutes. If you didn't request this, you can safely ignore this email.</p>
  `
  );

export const feedbackSubmittedTemplate = (name, feedbackTitle, sentiment) =>
  wrapper(
    'Feedback received',
    `
  <p>Hi ${name},</p>
  <p>Your feedback "<strong>${feedbackTitle}</strong>" has been received and analyzed by our AI system.</p>
  <p>Detected sentiment: <strong style="text-transform:capitalize;">${sentiment || 'processing'}</strong></p>
  <p>Thank you for helping improve government policy.</p>
  `
  );

export const negativeAlertTemplate = (percentage, department) =>
  wrapper(
    '⚠️ Negative Feedback Alert',
    `
  <p>Negative feedback has crossed the configured threshold${department ? ` for <strong>${department}</strong>` : ''}.</p>
  <p style="font-size: 28px; color:#dc2626; font-weight:bold;">${percentage}% negative</p>
  <p>Please review the officer dashboard for details.</p>
  `
  );

export const weeklyReportTemplate = (stats) =>
  wrapper(
    'Weekly Sentiment Report',
    `
  <p>Here is this week's feedback summary:</p>
  <ul>
    <li>Total feedback: <strong>${stats.total}</strong></li>
    <li>Positive: <strong>${stats.positive}</strong></li>
    <li>Negative: <strong>${stats.negative}</strong></li>
    <li>Neutral: <strong>${stats.neutral}</strong></li>
  </ul>
  `
  );
