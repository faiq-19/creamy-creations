# MVP handoff

## Built

An editorial, mobile-first cake storefront, keyboard-accessible portfolio gallery with URL occasion filters, ready-product cart and guest checkout, and an eight-step autosaving custom-cake brief with reference previews and final review. Custom requests use personal quotations, acceptance, advance proof and manual verification before confirmation. The visually distinct private dashboard covers urgent work, inquiries, quotes, order timelines and print summaries, production capacity/calendar, products/gallery, customers, payments, delivery, purchases, expenses, ingredient inventory, estimated profitability, business settings and approved customer feedback.

The application is Next.js App Router + TypeScript + Tailwind, using native accessible controls, React Hook Form, Zod and Recharts. Supabase PostgreSQL is the application’s only database. Supabase Auth protects administrators; Supabase Storage holds catalogue images and private proofs/references. Transaction functions enforce stock, advances, status history, expenses and inventory. RLS, token hashes, signed links, bounded uploads, request rate limits and idempotency protect sensitive workflows.

## Run and configure

Run `npm install`, copy `.env.example` to `.env.local`, then `npm run dev`. The public site runs with labelled sample data before configuration; submissions and admin access fail closed.

Environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`: project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: project public anonymous key.
- `SUPABASE_SERVICE_ROLE_KEY`: server-only service credential.
- `NEXT_PUBLIC_SITE_URL`: deployed origin or `http://localhost:3000` locally.
- `NEXT_PUBLIC_WHATSAPP_NUMBER`: optional fallback business mobile in `923xxxxxxxxx` format.
- `DATABASE_URL`: optional CLI PostgreSQL connection for seed loading; never public.

After installing the Supabase CLI: `supabase login`, `supabase link --project-ref YOUR_PROJECT_REF`, `supabase db push`. Development seed: `psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/seed.sql`. Local Supabase alternative: `supabase start` then `supabase db reset`.

Create the admin through Supabase Auth → Add user. Run `insert into public.profiles(id,role) values ('AUTH_USER_UUID','admin');` in the SQL editor. Disable public Auth signup. Sign in at `/login`, then set real WhatsApp, pickup area, delivery fee and payment instructions in Settings. Upload real product images and update availability before launch.

## Verification

- TypeScript checking and ESLint: passed.
- Vitest: 22 tests passed.
- Playwright: 10 desktop/mobile Chromium tests passed, including cart persistence, all eight form steps and draft recovery, gallery keyboard behavior, dialogs, responsive navigation and unauthorized access.
- Responsive/Axe: zero page overflow and zero WCAG AA violations across 25 public and 20 fictional admin screen/width combinations at 360, 390, 768, 1024 and 1440 pixels.
- Lighthouse mobile: Performance 95–98; Accessibility, Best Practices and SEO 100; LCP 1,998–2,460 ms; CLS 0.000–0.053; TBT 60–187 ms.
- PostgreSQL 17: all seven migrations and seed applied; business workflow, summary aggregates, private RPC access, RLS, retry, inventory, expense and rejection tests passed.
- Optimized Next.js production build: passed.
- Dependency audit after patching PostCSS: zero reported vulnerabilities.

PostgreSQL tests use minimal Supabase auth/storage schema stubs, not a hosted Supabase service. Live login, signed image delivery and end-to-end database-backed submissions still require credentials and the release smoke checks in `docs/verification.md`. Full visual evidence and performance reports are in `docs/ui-verification.md` and `artifacts/`.

## Limits and next steps

The site is not deployed, and real business details were not supplied. Sample photos are illustrative. No reviews are fabricated; approved feedback can be entered in the dashboard. Manual payments and rider booking are intentional. Inventory purchases currently use one ingredient per entry; there is no recipe-consumption automation. Main admin lists paginate at 30 records, selectors paginate at 25 choices, dashboard/customer reports use database aggregates, and calendar requests are date-bounded. Ancillary history and supplier lists remain capped for this MVP. Profit is estimated and uses the documented accounting assumptions; refunds require manual reconciliation.

Next priorities are a live Supabase smoke test/CI environment, backups and monitoring, replacement of sample content, pagination of ancillary history lists, multi-line purchase invoices, then optional payment and messaging integrations. No external messages were sent.

Full source-file inventory: `docs/file-manifest.md`. Detailed setup and accounting: `README.md`.
