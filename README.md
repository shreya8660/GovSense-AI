# GovSense AI

AI-powered Government E-Consultation Sentiment Analysis Platform.

Citizens submit feedback on government policies; Gemini/HuggingFace AI
automatically analyzes sentiment, emotion, keywords, and generates a summary
the moment it's submitted. Officers and Admins get real-time dashboards,
analytics, and automated reporting via n8n.

## Tech Stack

| Layer      | Tech |
|------------|------|
| Frontend   | React (Vite), Tailwind CSS, React Router, Axios, Framer Motion, Recharts, React Hook Form, React Toastify, i18next |
| Backend    | Node.js, Express.js, MongoDB (Mongoose), JWT, bcryptjs, Multer, Nodemailer, PDFKit, ExcelJS |
| AI         | Google Gemini API (primary) / HuggingFace Inference API (fallback) — modular, swappable service |
| Automation | n8n (4 example workflows) |
| Deployment | Frontend → Vercel · Backend → Render · Database → MongoDB Atlas |

## Users & Roles

1. **Citizen** — submits feedback (text or voice), tracks submissions, manages profile
2. **Government Officer** — dashboard with charts, reviews & approves feedback, exports reports
3. **Admin** — manages users, officers, departments, categories, policies, analytics, logs, settings

## Feature Overview

**Citizen**: landing page, About, Policies browser, feedback form (policy, department,
category, title, description, 1-5 rating, location, optional attachment, voice-to-text),
My Feedback history with AI sentiment badges, profile management, dark mode, 4 languages
(English/Hindi/Kannada/Tamil), fully responsive.

**AI (automatic on every submission)**: sentiment (positive/negative/neutral) with a
confidence score, emotion (happy/angry/sad/concerned/satisfied), keyword extraction,
one-sentence AI summary — all stored on the feedback record.

**Officer Dashboard**: stat cards (total/positive/negative/neutral/departments), sentiment
pie chart, department-wise bar chart, monthly trend line chart, searchable/filterable
feedback table, approve/reject, PDF + Excel export.

**Admin Dashboard**: manage users/officers (with approval workflow)/departments/categories/
policies, platform-wide analytics, activity log audit trail, system settings (including the
negative-feedback alert threshold used by n8n).

**Automation (n8n)**: submission → AI → store → email/Slack; weekly PDF report to officers;
negative-feedback threshold alert; monthly report archived to Google Drive. See `n8n/README.md`.

## Folder Structure

```
GovSense-AI/
├── frontend/                 # React + Vite SPA
│   └── src/
│       ├── components/       # Navbar, Footer, Hero, Dashboard, Charts, Cards, Feedback, Common
│       ├── layouts/          # MainLayout (public), DashboardLayout (role sidebar)
│       ├── pages/            # Home, About, Policies, Login, Register, Citizen, Officer, Admin, Profile
│       ├── context/          # AuthContext, ThemeContext
│       ├── hooks/            # useAuth, useTheme, useVoiceInput
│       ├── services/         # axios API clients (one per resource)
│       ├── i18n/              # i18next config + en/hi/kn/ta locale files
│       └── styles/
├── backend/                  # Express REST API
│   ├── config/                # DB connection
│   ├── controllers/
│   ├── middlewares/           # auth (JWT + n8n API key), upload, error handling, activity logger
│   ├── models/                # 11 Mongoose schemas
│   ├── routes/
│   ├── services/
│   │   ├── AI/                 # aiService.js + Gemini/HuggingFace providers
│   │   ├── Email/               # Nodemailer + HTML templates
│   │   └── Report/              # PDF (pdfkit) / Excel (exceljs) generation
│   ├── utils/                  # asyncHandler, apiResponse, generateToken, constants, seed.js
│   └── uploads/                 # feedback attachments (multer)
├── n8n/
│   ├── workflows/                # 4 exported workflow JSON files
│   └── README.md                 # setup + required credentials/env vars
├── DEPLOYMENT.md               # MongoDB Atlas + Render + Vercel + n8n hosting
├── API_DOCUMENTATION.md        # full endpoint reference
└── README.md                   # this file
```

## Data Models

11 collections in `backend/models/`, sharing enums from `backend/utils/constants.js`:
`User` (citizen), `Officer`, `Admin`, `Department`, `Category`, `Policy`, `Feedback`
(embeds the full AI result), `Notification` (polymorphic recipient), `Report`,
`ActivityLog` (audit trail), `Settings` (singleton config).

## Backend Architecture Notes

- **Auth**: a single `/api/auth/login` endpoint takes `{ email, password, role }` and checks
  the matching collection — JWT payload is `{ id, role }`. Officers require Admin approval
  (`isApproved`) before they can log in.
- **`allowServiceOrRole` middleware**: dashboard/report GET routes accept *either* an
  Officer/Admin JWT *or* an `x-api-key` header matching `N8N_API_KEY` — this is how n8n
  workflows pull stats/reports without a human login.
- **AI service is modular**: `services/AI/aiService.js` picks Gemini or HuggingFace via
  `AI_PROVIDER`, with automatic fallback to the other provider if the primary fails.
- **Copyright/data safety**: `.env` files are gitignored; `.env.example` documents every
  variable needed.

## Getting Started Locally

```bash
# 1. Backend
cd backend
cp .env.example .env      # fill in MongoDB URI, JWT secret, Gemini key, email creds
npm install
npm run seed               # creates a default admin + departments + categories
npm run dev                # http://localhost:5000

# 2. Frontend (in a new terminal)
cd frontend
cp .env.example .env
npm install
npm run dev                # http://localhost:5173
```

Log in as the seeded admin (printed by `npm run seed`), immediately change the password
under **Profile**, then use **Manage Officers** to create and approve officer accounts.

## Deployment

Full step-by-step guide (MongoDB Atlas → Render → Vercel → n8n) in **[DEPLOYMENT.md](./DEPLOYMENT.md)**.

## API Reference

Every endpoint, request body, and example response is documented in
**[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)**.

## Environment Variables

Full lists in `backend/.env.example` and `frontend/.env.example`. Minimum required to run:

- `MONGO_URI` — MongoDB Atlas connection string
- `JWT_SECRET` — random secret for signing tokens
- `GEMINI_API_KEY` (or `HUGGINGFACE_API_KEY` + `AI_PROVIDER=huggingface`)
- `EMAIL_USER` / `EMAIL_PASS` — SMTP credentials for notifications
- `CLIENT_URL` — frontend origin, used for CORS and email links

## Build Roadmap

- [x] **Module 1** — Project scaffolding
- [x] **Module 2** — MongoDB models
- [x] **Module 3** — Auth backend (JWT, register/login/logout/profile, forgot/reset password)
- [x] **Module 4** — Feedback + AI sentiment analysis backend
- [x] **Module 5** — Dashboard & reports backend (stats, charts, PDF/Excel export)
- [x] **Module 6** — Admin backend (users, officers, departments, categories, policies, logs, settings)
- [x] **Module 7** — Frontend foundation (routing, auth/theme context, i18n, services)
- [x] **Module 8** — Public pages (Home, About, Policies, Login, Register, password flows)
- [x] **Module 9** — Citizen dashboard (feedback form + voice input, My Feedback, Profile)
- [x] **Module 10** — Officer dashboard (stats, charts, feedback table, export)
- [x] **Module 11** — Admin dashboard (management panels, analytics, logs, settings)
- [x] **Module 12** — n8n workflow JSONs (4 workflows)
- [x] **Module 13** — Deployment guide + API documentation + final polish

## License

Proprietary — built for demonstration purposes.
