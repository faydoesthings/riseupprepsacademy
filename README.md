# RiseUp Preps Academy

Public website and operations portal for **RiseUp Preps Academy** — a not-for-profit school in Sukkur, Sindh, Pakistan. The platform combines a marketing site (programs, impact, admissions, donations) with role-based portals for administrators, teachers, students, donors, and accountants.

**Repository:** [github.com/faydoesthings/riseupprepsacademy](https://github.com/faydoesthings/riseupprepsacademy)

---

## Features

### Public website
- Home, About, Programs, Impact, Blog, Admissions, Contact, and Donate pages
- Interactive **Galaxy of Impact** — 3D visualization of enrollment, attendance, outcomes, and giving
- Transparent impact metrics driven by live academy data
- Responsive layout with motion-aware UI (respects reduced motion)

### Portals (role-based)
| Role | Capabilities |
|------|----------------|
| **Admin** | Students, teachers, classes, admissions, finance, audit log, notifications |
| **Teacher** | Timetable, attendance, assignments, exams, materials, payslips |
| **Student** | Timetable, assignments, results, fees, attendance |
| **Donor** | Donations, sponsored students, receipts, impact summary |
| **Accountant** | Fees, donations, expenses, payroll, reports |

Authentication is handled with **NextAuth v5** and bcrypt-hashed credentials.

---

## Tech stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL via [Prisma](https://www.prisma.io/)
- **Auth:** NextAuth v5
- **UI:** Tailwind CSS 4, Framer Motion, Lucide icons
- **3D (Impact page):** Three.js, React Three Fiber, Drei
- **Charts:** Recharts

---

## Prerequisites

- **Node.js** 20+
- **npm** 10+

Local development uses an **embedded PostgreSQL** instance (no separate Postgres install required).

---

## Quick start

```bash
# 1. Clone the repository
git clone https://github.com/faydoesthings/riseupprepsacademy.git
cd riseupprepsacademy

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env — set AUTH_SECRET (see below)

# 4. Provision database, schema, and seed data
npm run setup

# 5. Start PostgreSQL (keep this terminal open)
npm run db:postgres:start

# 6. In a new terminal, start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Generate `AUTH_SECRET`:

```bash
openssl rand -base64 32
```

---

## Environment variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (set automatically by `npm run setup`) |
| `AUTH_SECRET` | Random secret for session signing |
| `AUTH_URL` | Public app URL, e.g. `http://localhost:3000` |
| `NEXTAUTH_URL` | Legacy alias; keep in sync with `AUTH_URL` |

See [`.env.example`](.env.example) for a full template.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js development server |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run lint` | Run ESLint |
| `npm run setup` | Initialize embedded Postgres, push schema, seed data |
| `npm run db:postgres:start` | Start local PostgreSQL |
| `npm run db:push` | Push Prisma schema to database |
| `npm run db:seed` | Re-run seed script |
| `npm run db:studio` | Open Prisma Studio |

---

## Project structure

```
src/
├── app/
│   ├── (public)/          # Marketing pages
│   ├── portal/            # Role-based dashboards
│   ├── actions/           # Server actions
│   └── api/auth/          # NextAuth routes
├── components/            # UI by domain (impact, portal, layout, …)
├── data/                  # Static content (blog, programs, photos)
└── lib/                   # Auth, stats, formatting, utilities
prisma/
├── schema.prisma          # Database schema
└── seed.ts                # Demo / initial data
scripts/
└── postgres-dev.mjs       # Local embedded PostgreSQL helper
```

---

## Deployment notes

1. Use a managed PostgreSQL provider (Neon, Supabase, RDS, etc.).
2. Set all environment variables in your hosting platform.
3. Run `npx prisma db push` (or migrations) against production.
4. Run `npm run build` && `npm run start`, or deploy to Vercel/similar.

Do **not** commit `.env` or local database files. The embedded Postgres in `prisma/pg-data/` is for development only.

---

## License

Private — © RiseUp Preps Academy. All rights reserved.
