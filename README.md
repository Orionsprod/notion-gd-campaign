# 📊 Notion Campaign Sync

Automates syncing of Facebook campaign and adset data from Google Sheets into Notion databases, maintaining relationships and avoiding duplicates.

## 🧩 Structure

- **sync/**: Core sync logic for campaigns and adsets
- **utils/**: Helpers for Notion, Google Sheets, and environment config
- **google_auth.ts**: Auth setup for Google Sheets
- **sync_handler.ts**: Webhook handler that ties everything together

## ⚙️ Environment Variables

Set these in Deno Deploy or `.env`:

### Notion
- `NOTION_API_KEY`
- `NOTION_CAMPAIGNS_DB_ID`
- `NOTION_ADSETS_DB_ID`

### Google Sheets
- `GOOGLE_SERVICE_ACCOUNT_JSON` — stringified JSON with `\n`-escaped private key
- `GOOGLE_SHEET_ID`

## 📝 Sheets Used

- `ad-account/insights/unique campaigns`
- `ad-account/insights/unique adsets` (must include `campaign_name` column)

## 🚀 Deploy Instructions

1. Deploy `sync_handler.ts` as your entry point in Deno Deploy
2. Add environment variables listed above
3. Trigger your webhook every 3 days to ingest and relate new campaign/adset data

