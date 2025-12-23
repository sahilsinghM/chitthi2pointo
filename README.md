# chitthi2pointo
Goal: Beehiiv-like newsletter platform MVP
MVP scope:
- Auth
- Publications
- Posts
- Subscribers
- Email sending
- Basic analytics

## Architecture (MVP)
### Stack
- Next.js (App Router) + TypeScript
- Postgres + Prisma
- Amazon SES for email delivery
- Queue-based sending for campaign dispatch
- Multi-tenant model (users → publications)

### App folder outline
```
/app
  /(auth)
    /login
    /signup
  /(dashboard)
    /[publicationSlug]
      /overview
      /campaigns
        /new
        /[campaignId]
      /subscribers
      /segments
      /settings
  /api
    /auth
      /login
      /logout
    /publications
    /subscribers
    /segments
    /campaigns
    /send
  /subscribe
    /[publicationSlug]
```

### Core models (Prisma)
See `prisma/schema.prisma` for:
- Users + sessions
- Publications + memberships (multi-tenant)
- Subscribers, tags, segments
- Campaigns + queue-based send jobs

### MVP API routes / server actions
- Auth: login, logout, session refresh
- Publications: CRUD, update sender settings
- Subscribers: import, CRUD, tag management, unsubscribe
- Segments: CRUD and recompute segment members
- Campaigns: CRUD, schedule, publish, send
- Send: enqueue jobs, worker to process jobs, webhook to record SES events

### Background jobs
- Campaign fan-out: create SendJob rows for targeted subscribers
- SendJob processor: pull queued jobs, send via SES, update status
- SES webhook processor: update bounces/complaints/unsubscribes
- Segment recompute: refresh SegmentMember rows from filters
- Subscriber cleanup: mark inactive or dedupe

### Required environment variables
- `DATABASE_URL`
- `NEXTAUTH_SECRET` (or custom auth secret)
- `NEXT_PUBLIC_APP_URL`
- `SES_REGION`
- `SES_ACCESS_KEY_ID`
- `SES_SECRET_ACCESS_KEY`
- `SES_CONFIGURATION_SET` (optional)
- `EMAIL_FROM_DEFAULT`
- `QUEUE_WORKER_INTERVAL_MS`
- `QUEUE_BATCH_SIZE`
- `S3_UPLOAD_BUCKET` (if storing uploads/media)

## MVP test checklist
- [ ] Create a publication (verify slug, sender identity, and membership).
- [ ] Add subscribers (manual add + CSV import + tag assignment).
- [ ] Send test email (enqueue campaign, worker processes batch send).
- [ ] Open + click tracked (tracking pixel and link redirects record events).
- [ ] Unsubscribe works (tokenized link marks subscriber unsubscribed and logs event).

## Deployment (Vercel + Supabase/Neon + SES sandbox)
### 1) Provision Postgres
- Create a Postgres project in Supabase or Neon.
- Copy the connection string and set it as `DATABASE_URL`.
- Run Prisma migrations (e.g. `npx prisma migrate deploy`).

### 2) Configure Amazon SES (sandbox)
- Verify a sender identity (email or domain) in SES.
- Keep SES in sandbox for initial testing; only verified recipients can receive emails.
- Create IAM credentials with SES send permissions.

### 3) Deploy the Next.js app on Vercel
- Create a new Vercel project from this repo.
- Set environment variables:
  - `DATABASE_URL`
  - `NEXTAUTH_SECRET`
  - `NEXT_PUBLIC_APP_URL` (use the Vercel URL)
  - `AWS_REGION`
  - `SES_ACCESS_KEY_ID`
  - `SES_SECRET_ACCESS_KEY`
  - `EMAIL_FROM_DEFAULT`
  - `QUEUE_WORKER_INTERVAL_MS`
  - `QUEUE_BATCH_SIZE`
- Deploy the app.

### 4) Run the worker process
- Provision a lightweight Node runtime (Vercel Cron + external worker, Railway, Render, or a VPS).
- Run `npm run worker` to process queued send jobs.
- Ensure the worker shares the same `DATABASE_URL` and SES credentials.
