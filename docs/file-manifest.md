# File inventory

The workspace was empty when the MVP work began. The repository now contains the following authored source groups. Dependency caches, `.next` output, browser binaries, local Supabase state and secrets are excluded.

## Application and configuration

- Root configuration: `.env.example`, `.gitignore`, `eslint.config.mjs`, `next.config.ts`, `package.json`, `package-lock.json`, `playwright.config.ts`, `postcss.config.mjs`, `tsconfig.json`, `vitest.config.mts`.
- Public App Router pages: `src/app/(public)/` for home, gallery, shop, custom cake, checkout, login, quote and order status.
- Admin App Router pages: `src/app/admin/` for the dashboard and all operational sections.
- Route handlers: `src/app/api/` for admin operations/options, cart products, checkout, login/logout, quotes, custom requests and uploads.
- Global application files: `src/app/layout.tsx`, `globals.css`, `tokens.css`, loading/error/not-found states and the generated application icon.
- Development-only admin fixture: `src/app/design-preview/page.tsx`; it returns 404 in production and never bypasses real admin authorization.

## Components and libraries

- Public interaction and display: `src/components/cards.tsx`, `cart.tsx`, `catalogue-navigation.tsx`, `custom-form.tsx`, `dialog.tsx`, `form-utils.tsx`, `forms.tsx`, `gallery.tsx`, `navigation.tsx`, `store.tsx`, `ui.tsx`.
- Admin workspace: `src/components/admin.tsx`, `dashboard.tsx`, `data-table.tsx`, `order-summary.tsx`, `reference-select.tsx`, `sales-chart.tsx`.
- Domain/server modules: `src/lib/admin-data.ts`, `admin-fields.ts`, `admin-schema.ts`, `catalogue.ts`, `domain.ts`, `image-processing.ts`, `messaging.ts`, `presentation.ts`, `server.ts`, `supabase.ts`, `uploads.ts`.
- Authentication middleware: `src/middleware.ts`.

## Assets

- Licensed local variable fonts and their license files: `public/fonts/`.
- Four compressed illustrative catalogue photographs: `public/images/`.
- Placeholder and browser icons: `public/cake-placeholder.svg`, `public/favicon.ico`, `src/app/icon.png`.

## Database and tests

- Supabase configuration, seven ordered migrations and fictional development seed: `supabase/`.
- Unit tests: `tests/domain.test.ts`, `tests/image-processing.test.ts`.
- Desktop/mobile browser tests: `tests/e2e/storefront.spec.ts`.
- Disposable PostgreSQL harness: `tests/db/bootstrap.sql`, `tests/db/workflows.sql`, `scripts/test-db.sh`.
- Visual/performance scripts: `scripts/capture-ui.mjs`, `scripts/capture-admin.mjs`, `scripts/lighthouse.mjs`.

## Documentation and evidence

- Setup and operations: `README.md`.
- Architecture, schema, workflows, implementation notes, design system, verification and handoff: `docs/`.
- Responsive screenshots, Axe JSON, and Lighthouse HTML/JSON reports: `artifacts/`.

Run `rg --files | sort` for the exact current file list.
