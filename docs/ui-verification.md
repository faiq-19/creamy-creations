# UI verification

Verification was run against an optimized production build in `CREAMY_DEMO=1` mode. This mode uses the labelled illustrative catalogue, keeps all customer mutations disabled, and does not publish an unverified WhatsApp number. Admin screens were rendered from the development-only fictional fixture; normal `/admin` authorization remained active and `/design-preview` returned 404 in the production build.

## Responsive and accessibility checks

Playwright rendered the public home, gallery, ready-to-order, custom-cake, and empty-checkout pages at 360, 390, 768, 1024, and 1440 CSS pixels. The same widths covered the admin overview, long order detail, month calendar, empty/error states, and mobile drawer. Every checked screen had document width equal to viewport width. Tables intentionally scroll inside labelled table regions.

Automated Axe checks used WCAG 2 A, WCAG 2 AA, and WCAG 2.1 AA tags. They reported zero violations across all 25 public page/width combinations and all 20 admin fixture/width combinations. The interaction suite also checked the filled checkout, gallery dialog, and final custom-request review. Keyboard checks covered Escape dismissal and trigger-focus restoration for drawers/dialogs, plus left/right navigation in the gallery lightbox.

Screenshots are in [`artifacts/ui`](../artifacts/ui):

- [`home-390.png`](../artifacts/ui/home-390.png) and [`home-1440.png`](../artifacts/ui/home-1440.png)
- [`gallery-390.png`](../artifacts/ui/gallery-390.png) and [`gallery-lightbox-390.png`](../artifacts/ui/gallery-lightbox-390.png)
- [`custom-review-390.png`](../artifacts/ui/custom-review-390.png)
- [`checkout-filled-390.png`](../artifacts/ui/checkout-filled-390.png)
- [`admin-overview-1440.png`](../artifacts/ui/admin-overview-1440.png), [`admin-order-390.png`](../artifacts/ui/admin-order-390.png), [`admin-calendar-390.png`](../artifacts/ui/admin-calendar-390.png), and [`admin-drawer-390.png`](../artifacts/ui/admin-drawer-390.png)

Machine-readable results are [`accessibility.json`](../artifacts/ui/accessibility.json) and [`admin-accessibility.json`](../artifacts/ui/admin-accessibility.json).

## Lighthouse mobile results

Lighthouse 13 ran sequentially against the local optimized build with its default mobile throttling. Full HTML and JSON reports are in [`artifacts/lighthouse`](../artifacts/lighthouse).

| Page           | Performance | Accessibility | Best practices | SEO |      LCP |   CLS |    TBT |
| -------------- | ----------: | ------------: | -------------: | --: | -------: | ----: | -----: |
| Home           |          98 |           100 |            100 | 100 | 2,268 ms | 0.050 |  71 ms |
| Gallery        |          96 |           100 |            100 | 100 | 2,628 ms | 0.001 |  95 ms |
| Ready to order |          97 |           100 |            100 | 100 | 2,552 ms | 0.001 |  53 ms |
| Custom cake    |          97 |           100 |            100 | 100 | 1,961 ms | 0.005 | 186 ms |

All requested Lighthouse, LCP, and CLS targets passed. Lighthouse did not expose field Interaction to Next Paint data for this local preview. Total Blocking Time, the available lab responsiveness proxy, remained under 200 ms on every audited page; no field-INP claim is made.

The serif heading font uses `font-display: optional` and is outside the slow-network preload path. On a constrained first visit the size-adjusted Georgia fallback can render for that visit; subsequent or sufficiently fast visits use the local Cormorant Garamond file. This keeps text visible and LCP within target without a layout-blocking font download.

## Bundles and remaining opportunities

The production build reports 102 kB of shared first-load JavaScript. Home, checkout, shop, and login are about 112 kB; gallery is 114 kB; admin entry is 120 kB. The custom brief is the largest public entry at 156 kB because its 44.2 kB route chunk contains React Hook Form and Zod validation. Recharts is dynamically loaded only after an administrator chooses to show the chart and is absent from the public initial bundles.

Lighthouse still suggests roughly 20–41 kB of potential image savings on the illustrative local photographs and about 12 kB of legacy-JavaScript savings from framework output. Those are below the performance target and can be revisited when real bakery photographs replace the samples. Back/forward-cache checks on dynamic pages are affected by the local development session and were not treated as field behavior.

## Functional verification

- 22 Vitest checks pass, including image decoding/compression/thumbnail behavior and calendar date ranges.
- 10 Playwright desktop/mobile tests pass, covering URL filters, lightbox keyboard behavior, cart stock and persistence, all eight request steps, local draft recovery, image preview, final review, mobile navigation, fail-closed admin/API access, and the production-only preview guard.
- The disposable PostgreSQL 17 harness applies all migrations and the development seed, then passes workflow, idempotency, stock rollback, verified advance, capacity, reporting aggregate, private RPC, rate-limit, and RLS checks. It publishes no database port and removes its container afterward.
- TypeScript, ESLint, the optimized build, and `npm audit` pass; npm reports zero known vulnerabilities.

Live Supabase Auth, Storage signed URLs, and database-backed customer submissions still require configured project credentials and a deployment smoke test. Sample photographs are clearly labelled and are not represented as the bakery's portfolio. Real contact, pickup, delivery-fee, payment, product, and approved testimonial data must be entered before launch.
