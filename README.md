# Creamy Creations

A mobile-first Karachi cake storefront and private operations application. Custom cakes follow consultation → quotation → acceptance → verified advance → production. Ready products use guest checkout.

## Development

Node 22+ required. Run `npm install`, copy `.env.example` to `.env.local`, then `npm run dev`. Without Supabase configuration the public catalogue displays sample designs; mutations and admin access fail closed.

## Supabase setup

Create a Supabase project. Install the Supabase CLI, run `supabase login`, `supabase link --project-ref YOUR_REF`, then `supabase db push`. To seed a **development** project, run `psql "$DATABASE_URL" -f supabase/seed.sql`. Alternatively execute migration then seed in the SQL editor. `supabase start` and `supabase db reset` provision a local development database with seeds. Never seed real customer environments.

Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SITE_URL, and NEXT_PUBLIC_WHATSAPP_NUMBER. The service key is server-only. Configure business_settings before launch, including contact, capacity, delivery fees, and payment instructions. Create an administrator using Supabase Auth → Add user, then run `insert into public.profiles(id,role) values ('AUTH_USER_UUID','admin');`. Disable public signups in Supabase Auth. Password login is at `/login`.

## Accounting

All amounts are PKR numeric decimals. Cake revenue = product subtotal − discount. Gross cake profit = cake revenue − ingredient − decoration − packaging − labour − other direct costs. Delivery collections and actual delivery costs are separate. Estimated net = gross cake profit + delivery collections − actual delivery costs − operating expenses. Revenue is recognized on completed orders, by completion date, not deposits. Refunds must be recorded as expenses/refund entries and reflected in order adjustments; refunded orders are excluded. Purchases capitalize stock; they are not operating expenses. Ingredient consumption costs must be entered on orders to avoid double counting purchases. Missing costs make profits estimates. Expense allocation is explicit: operating expenses affect monthly net; order allocations atomically increase the selected direct cost or actual delivery cost. Do not re-enter allocated expenses in manual cost totals. Refund expenses use operating allocation; full refunds exclude the refunded order from recognized revenue, so do not also post a full refund expense for that excluded revenue. No tax, depreciation, accrual payables or formal ledger is provided.

## Verification

`npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, `npm run test:e2e`. See docs for workflows and deployment limitations. Apply SQL migrations before exercising live workflows.

## Application map

Public: `/`, `/gallery`, `/shop`, `/custom-cake`, `/checkout`, `/quote/[token]`, `/order/[token]`. Admin: `/login`, `/admin`, and sections for inquiries, orders, calendar, products, gallery, customers, payments, delivery, expenses, inventory, purchases, settings and testimonials.

Private uploads are signed for 120 seconds. Request upload links expire in one hour and accept up to five references. Quotation tokens are 256-bit random values stored as hashes; a newly created quote's full link is shown once. Copy it or open the customer WhatsApp action before leaving. Revising creates a new link. Guest checkout and custom request retries use idempotency keys to avoid duplicate reservations. Customer proof uploads never verify payments automatically. Admin payments are append-only; corrections use an explicit refund/new payment entry.

The notification outbox stores events; `src/lib/messaging.ts` supplies the click-to-chat adapter and templates. Nothing automatically sends a message, charges a customer or books a rider.

## Commands

```sh
npm install
cp .env.example .env.local
npm run dev
npm run typecheck
npm run lint
npm test
npm run test:db        # requires Docker; creates and removes an isolated PostgreSQL container
npm run build
npx playwright install chromium
npm run test:e2e       # uses a production build and starts a local server
```

For a hosted project, migrations and fictional development seed:

```sh
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/seed.sql
```

Do not put `DATABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` in a `NEXT_PUBLIC_` variable. `.env.local` is ignored by git. `DATABASE_URL` is used only by CLI setup, not the application. The site URL must be the full deployed HTTPS origin with no trailing slash.

## Practical limits

The MVP uses manual payment verification, rider booking, cost entry and refunds. There is no payment gateway, automated messaging, recipe-based ingredient consumption or customer login. Inventory purchases currently record one ingredient line per entry; repeat the entry for additional ingredients on the same supplier invoice. Main admin lists use server pagination (30 records); searchable record selectors load 25 choices at a time. Dashboard and customer totals are SQL aggregates. Calendar queries are limited to the selected date range (up to 1,000 events per type); ancillary supplier and history lists remain bounded and should be paginated for larger deployments. Use the calendar and quotation revision flow to review feasibility; capacity does not automatically reject inquiries. Basic reporting is an estimate, not statutory accounts.

Live Supabase Auth/Storage smoke tests need project credentials. Sample photos are illustrative Unsplash images, not claims about the bakery's actual work. No customer reviews have been invented; publish real approved feedback through Testimonials. See [verification notes](docs/verification.md), [architecture](docs/architecture.md), [database schema](docs/database-schema.md), and [workflows](docs/order-workflows.md).

Recommended next improvements: live Supabase CI, pagination for ancillary histories, daily backups and error monitoring, richer multi-line supplier invoices, and optional WhatsApp Cloud API/n8n delivery of the existing notification events.

## UI preview and audit

Apply `supabase/migrations/202609130001_ui_catalogue.sql` before running the updated app against an existing database. It adds image descriptions, filter indexes, and private summary RPCs. The UI work does not apply migrations to your live project.

To preview without starting Supabase, build and start with `CREAMY_DEMO=1` on both commands. This enables the illustrative catalogue and disables live mutations/admin access. Never set it on a live business deployment. The end-to-end configuration uses localhost port 3100.

```sh
CREAMY_DEMO=1 npm run build
CREAMY_DEMO=1 npm run start -- --hostname 127.0.0.1 --port 3100
node scripts/capture-ui.mjs
node scripts/lighthouse.mjs
```

Fictional admin visual fixtures are available only in development: `CREAMY_DEMO=1 UI_PREVIEW=1 NEXT_DIST_DIR=.next-preview npm run dev -- --port 3102`, then `/design-preview?screen=overview` (also `order`, `calendar`, `states`). This route returns 404 in production; it does not bypass `/admin` authorization. Run `node scripts/capture-admin.mjs` against that preview. See [UI verification and screenshots](docs/ui-verification.md) and [design system](docs/design-system.md).

Uploaded catalogue/reference images are decoded, compressed to bounded WebP files, and receive 240px thumbnails. Payment/receipt originals are preserved as evidence; their previews are compressed. Private previews and full files require short-lived signed URLs. Font files are local Latin subsets with licenses alongside them.
