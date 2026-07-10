# West Visayas State University — USC Unified Calendar

Database-backed calendar web application for Academic Year **2026–2027**. Public users can view events; administrators can add, edit, and delete events stored permanently in PostgreSQL.

## Tech Stack

- **Next.js** (App Router) + TypeScript
- **Tailwind CSS** + Lucide icons
- **Prisma** ORM + **PostgreSQL** (Neon / Supabase compatible)
- **Vercel** deployment

## Features

- Public calendar (`/calendar`) — month & list views, search, filters, event details
- Admin dashboard (`/admin`) — password-protected CRUD
- Conflict checker (`/conflicts`) — venue, date, and holiday overlaps
- **Database is the source of truth** — events persist across redeploys
- **Seed runs manually only** — never overwrites existing records

---

## 1. Install Dependencies

```bash
cd wvsu-usc-calendar
npm install
```

## 2. Set Up the Database

1. Create a free PostgreSQL database at [Neon](https://neon.tech) or [Supabase](https://supabase.com).
2. Copy the connection string.
3. Create `.env` from the example:

```bash
cp .env.example .env
```

4. Edit `.env`:

```env
DATABASE_URL="postgresql://..."
ADMIN_PASSWORD="your-secure-admin-password"
```

## 3. Run Migrations

```bash
npx prisma migrate dev --name init
```

For production (Vercel):

```bash
npx prisma migrate deploy
```

## 4. Seed Initial Calendar Data (Once)

The seed loads ~1,077 WVSU USC events from `prisma/events.json`.

**Important:**
- Run this **only once** during initial setup.
- Existing records are **never overwritten**.
- Safe to re-run — it only inserts missing events.

```bash
npm run db:seed
```

## 5. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

| Route | Description |
|-------|-------------|
| `/` | Landing page with stats & upcoming events |
| `/calendar` | Public calendar (view only) |
| `/conflicts` | Conflict checker |
| `/admin/login` | Admin login |
| `/admin` | Admin dashboard |
| `/admin/events` | Manage all events |
| `/admin/events/new` | Add event |
| `/admin/events/[id]/edit` | Edit event |

## 6. Deploy on Vercel

1. Push this project to GitHub.
2. Import the repo in [Vercel](https://vercel.com).
3. Add environment variables:
   - `DATABASE_URL`
   - `ADMIN_PASSWORD`
4. Deploy.

**Build command:** `npm run build` (default)  
**Post-install:** `prisma generate` runs automatically via `postinstall`.

### After First Deploy

Run migrations against production:

```bash
DATABASE_URL="your-production-url" npx prisma migrate deploy
DATABASE_URL="your-production-url" npm run db:seed
```

Or use Vercel CLI / Neon console to run these once.

## 7. Adding Events (Admin)

1. Go to `/admin/login`
2. Enter your `ADMIN_PASSWORD`
3. Click **Add Event** or go to `/admin/events/new`
4. Fill in the form and save — changes are written to the database immediately
5. Public calendar updates after save (pages revalidate automatically)

## 8. Avoid Overwriting Data on Redeploy

| ✅ Safe | ❌ Avoid |
|---------|----------|
| `prisma migrate deploy` for schema changes | Running seed on every deploy |
| Manual `npm run db:seed` once at setup | Deleting/truncating tables in build scripts |
| Editing events via admin UI | Hard-coding events in source code |

The seed script uses **insert-only** logic: if an event ID already exists, it is skipped.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run db:migrate` | Run migrations (dev) |
| `npm run db:deploy` | Run migrations (production) |
| `npm run db:seed` | Seed calendar data (manual, once) |
| `npm run db:studio` | Open Prisma Studio |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `ADMIN_PASSWORD` | Yes | Password for admin login |
| `SESSION_SECRET` | No | Optional session signing secret |

## License

Built for West Visayas State University University Student Council.
