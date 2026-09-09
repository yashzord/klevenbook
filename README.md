# KlevenBook

Invoicing for small Indian medical distributors. GST-ready tax invoices, quotations, delivery challans, purchase bills, payments in and out, WhatsApp sharing, products, customers, vendors, and CSV exports for GST filing. Open source (MIT).

Built with Next.js 16, Supabase, Tailwind. Deployed on Vercel at book.klevencare.com.

## Run locally

Needs Node 24 and Docker.

```bash
npm install
npx supabase start          # local Postgres + Auth in Docker
npx supabase status -o env  # copy API_URL and PUBLISHABLE_KEY into .env.local (see .env.example)
npm run dev
```

Create a login (local only):

```bash
curl -X POST http://127.0.0.1:54321/auth/v1/admin/users \
  -H "apikey: $SERVICE_ROLE_KEY" -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"choose-one","email_confirm":true}'
```

## Tests

```bash
node --test lib/gst.test.ts
```

## Schema changes

Migrations live in `supabase/migrations/` and are additive only. Never drop or rename a column in the same release that stops using it.

Apply locally with `npx supabase db reset`. Before applying to production, back it up (free tier has no automatic backups):

```bash
mkdir -p backups && pg_dump "$SUPABASE_DB_URL" -Fc -f "backups/$(date +%F).dump"
```

## Keep-alive

Supabase pauses free projects idle for 7 days. `vercel.json` runs `/api/keepalive` daily. Set `CRON_SECRET` in Vercel.
