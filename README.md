# Odyssée Advisory — Client Portal

Full-stack platform for a French legal consultancy serving real estate investors in Dubai.

## Stack
Next.js 14 (App Router) · TypeScript · Tailwind CSS · Shadcn/UI · Supabase · Stripe · Resend · Yousign

## Getting started

```bash
npm install
cp .env.local.example .env.local   # if you keep a sample
npm run dev
```

The app runs on http://localhost:3000.

## Project layout

- `app/(auth)` — login / register
- `app/(client)` — investor portal (dashboard, dossier, documents, factures, messagerie)
- `app/(avocat)` — lawyer admin (dashboard, clients, dossiers, factures)
- `app/api` — server route handlers
- `components/` — `ui/` (shadcn), `layout/`, `shared/`, plus feature folders
- `lib/supabase` — server/client/middleware
- `types/` and `hooks/` — TS types and React hooks

## Required env vars

See `.env.local`. Until those are filled, auth and payments will not function but UI renders.
