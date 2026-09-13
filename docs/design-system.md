# Creamy Creations design system

## Direction

An editorial bakery identity: warm ivory, chocolate text, restrained dusty rose, fine neutral borders, and photography with deliberate space. The public site feels personal; operations use a compact, quiet workspace. No invented reviews or credentials, no decorative continuous motion.

## Foundations

- Colour: background `#fffaf6`, white surface, soft surface `#f9f1ec`, foreground `#241a17`, muted `#70615b`, primary `#93485c`, hover `#79384a`, chocolate `#4b3029`, decorative gold `#b38b4b`, border `#e5d9d1`, success `#326a51`, danger `#a13c3c`.
- Typography: locally served variable Cormorant Garamond for editorial headings; DM Sans for body and operations. Both use `next/font/local` Latin subsets. Body text swaps to DM Sans; headings use optional display and a size-adjusted Georgia fallback so slow first visits never wait on the decorative font. Body and form controls are at least 16px on mobile.
- Spacing: 4px base; 8, 12, 16, 24, 32, 48, 64, 96px steps. Main container max 1280px with 20–48px fluid gutters.
- Radius: controls 10px, cards 16px, panels 20px, hero image 180px/180px/20px/20px. Shadows stay small and neutral.
- Touch targets: minimum 44px for actionable controls. Focus uses a high-contrast visible outline. Status includes a text label, never colour alone.

## Shared components and interactions

The public shell includes the brand, desktop navigation, native-dialog mobile drawer, footer, route-aware contact link and offline notice. Native dialog provides focus trapping, Escape dismissal and focus restoration. Gallery lightbox adds arrow-key navigation, a caption and a scoped request CTA. Cards use stable image ratios and responsive `next/image` delivery. Filters and pages are represented in URLs.

The custom brief has eight small steps, blur validation, a seven-day local text draft, explicit draft clearing, image previews, and a final review. Private images are never saved to localStorage. A booking notice remains visible. Checkout provides an expandable summary on mobile and sticky summary on desktop.

Admin pages use a dedicated sidebar/drawer, breadcrumbs, urgent-work links, consistent status badges, bounded tables, and a chart loaded only when requested. Public routes never import Recharts. Motion uses CSS (150–220ms), with reduced-motion overrides.

## Verification

See `docs/ui-verification.md` for actual viewport, accessibility and Lighthouse measurements, screenshots, and any remaining exceptions. Targets are engineering goals, not claims about unmeasured field traffic.
