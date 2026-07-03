# GovSense AI - n8n Workflows

Four example workflows that automate notifications and reporting on top of
the backend REST API. Import each JSON file into n8n (**Workflows → Import
from File**), then configure credentials/env vars below before activating.

| File | Trigger | What it does |
|------|---------|--------------|
| `01-feedback-submission-notification.json` | Webhook (`POST /webhook/govsense-feedback-submitted`) | Emails the citizen a confirmation; if sentiment is negative, also emails the department and posts to Slack |
| `02-weekly-report-email.json` | Cron - every Sunday 08:00 | Pulls the weekly PDF report from the API and emails it to officers |
| `03-negative-feedback-alert.json` | Cron - every 6 hours | Polls `/api/dashboard/stats`; if `negativePercentage` exceeds the threshold, sends an urgent email + Slack alert |
| `04-monthly-report-drive.json` | Cron - 1st of month, 06:00 | Generates the monthly PDF report, uploads it to Google Drive, and emails admins a link |

## Required n8n environment variables

Set these under **n8n Settings → Variables** (or your n8n host's env):

```
BACKEND_URL=https://your-backend.onrender.com
N8N_API_KEY=<same value as backend's N8N_API_KEY>
NEGATIVE_ALERT_THRESHOLD=40
EMAIL_FROM=GovSense AI <noreply@govsense.ai>
OFFICER_DIGEST_LIST=officers@yourgov.example
ADMIN_DIGEST_LIST=admins@yourgov.example
GDRIVE_REPORTS_FOLDER_ID=<Google Drive folder ID>
```

## Required credentials

- **SMTP** (`govsense-smtp`) - same mailbox as the backend's `EMAIL_*` vars, or a dedicated automation inbox
- **Slack API** (`govsense-slack`) - a bot token with `chat:write` scope for the `#govsense-alerts` channel
- **Google Drive OAuth2** (`govsense-gdrive`) - only needed for Workflow 4

## Connecting Workflow 1 to the backend

`feedbackController.createFeedback` already calls `N8N_WEBHOOK_URL` (set in
`backend/.env`) after every submission, with this payload:

```json
{
  "event": "feedback.created",
  "feedbackId": "...",
  "title": "...",
  "department": "...",
  "sentiment": "positive | negative | neutral",
  "confidenceScore": 0.87
}
```

Point `N8N_WEBHOOK_URL` at the Production URL n8n shows for Workflow 1's
webhook node once it's activated.

## Notes

- These JSON files are hand-authored templates matching a recent n8n node
  schema. Node parameter shapes occasionally change between n8n versions —
  if an import errors on a specific node, delete and re-add that node using
  the same trigger/action type, then reconnect it.
- Workflows 2-3-4 authenticate to the backend using the `x-api-key` header
  (`N8N_API_KEY`), handled by the `allowServiceOrRole` middleware — no human
  login required.
