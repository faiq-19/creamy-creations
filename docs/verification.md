# Verification and release checks

The application has three verification layers:

- Vitest tests validate Pakistani mobile normalization, request and quote validation, booking acknowledgement, accounting formulas, capacity warnings, calendar ranges, image signatures, server-side image compression and thumbnails.
- Playwright tests exercise URL filters, gallery lightbox keyboard behavior, cart stock limits and persistence, the eight-step brief and local draft recovery, image previews, mobile navigation, protected admin routes and unauthorized private-image requests on desktop and mobile Chromium.
- `npm run test:db` starts a disposable PostgreSQL 17 container, applies the actual migrations and seed, then checks request/checkout idempotency, quote acceptance, verified advances, status history, stock rollback, weighted inventory costs, expense allocation, dashboard/customer aggregates, private RPC permissions, rate limits and RLS. It cleans up its own container.

Responsive screenshots, Axe results, Lighthouse measurements, bundle sizes and known limitations are recorded in [`ui-verification.md`](ui-verification.md).

The database harness supplies minimal test-only `auth.users`, `auth.uid()` and storage schemas. It verifies PostgreSQL functions and policies; it does not impersonate a running Supabase Auth or Storage service. Hosted Supabase cookie refresh, actual signed image downloads and a fully live checkout require configured Supabase credentials and remain deployment smoke checks.

Before launch, create an admin, log in, add a real product and image, place a guest order, upload proof, verify payment, progress the order, submit a custom request with references, send/accept a quotation, and record a purchase. Check a second browser cannot view private records or images. Replace illustrative images, publish customer feedback only with permission, set business contact/payment/pickup details, and use an HTTPS origin.

Configure the deployment proxy to overwrite `X-Forwarded-For` with trusted client IPs. The app uses PostgreSQL-backed request limits and bounded request bodies; a public edge rate limiter/CAPTCHA can be added for larger traffic. Back up PostgreSQL and Storage, restrict Supabase project access, and configure monitoring for route failures.
