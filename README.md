# PickleQ

A [pickleq.app](https://pickleq.app/)-style **pickleball open play manager** — live queue, court rotation, player check-in, and a public live link for players.

## Quick start

```powershell
npm install
npm run db:push          # reset schema (first time or after schema change)
npm run dev
```

- **Homepage:** http://localhost:3000
- **Start session:** http://localhost:3000/session/new
- **Live player view:** http://localhost:3000/live/{slug}

## How it works

1. **Create a session** — name + number of courts (no signup)
2. **Add players** — build your roster
3. **Check in players** — adds them to the live queue
4. **Auto-staging** — when 4 players are queued and a court is free, a match starts automatically
5. **Record winners** — players return to queue; stats update; next match stages
6. **Share live link** — players follow queue & standings on their phones

## Data & queue

| Table | Purpose |
|-------|---------|
| `sessions` | Open play session (name, slug, courts) |
| `players` | Roster, check-in status, queue position, W/L |
| `courts` | Court availability |
| `matches` | Active/completed matches with teams |
| `jobs` | Background queue (`player.check_in`, `match.stage`, `match.complete`) |

Locally, data persists in **`pickle.db`** (SQLite). **Vercel cannot use a local SQLite file** — the serverless filesystem is read-only.

### Deploy on Vercel

1. Create a free [Turso](https://turso.tech) database (libsql).
2. Push the schema: `DATABASE_URL=libsql://... DATABASE_AUTH_TOKEN=... npm run db:push`
3. In Vercel → **Settings → Environment Variables**, add:
   - `DATABASE_URL` = `libsql://your-db-name-org.turso.io`
   - `DATABASE_AUTH_TOKEN` = your Turso token
4. Redeploy.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run db:push` | Sync database schema |
| `npm run queue:worker` | Optional dedicated job worker |

## vs pickleq.app

This is a functional MVP inspired by PickleQ's core flow. Not yet included: DUPR export, offline PWA, Reclub import, kiosk mode, tournament mode, or advanced matching algorithms.
