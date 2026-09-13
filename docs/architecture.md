# Architecture

Next.js App Router renders public pages and protected operations pages. Route handlers validate Zod payloads and authorize administrators using Supabase Auth plus a profiles role lookup. A server-only Supabase service client submits controlled guest operations. PostgreSQL functions provide atomic stock reservations, quote decisions, payment verification, order transitions and inventory purchases. RLS denies public access to private records. Public product/gallery reads are active-only. Private uploads use signed URLs after role or scoped token verification. An outbox records notification events for future messaging adapters. No messaging is sent automatically.

Public request and checkout endpoints enforce database-backed rate limits. Quotation tokens are cryptographically random and stored as SHA-256 hashes; only explicitly projected customer data is returned. Guest order receipts use separate scoped tokens. Admin cookies are validated on every protected request; no privileged key reaches client bundles.

## Boundaries and integrations

- `src/app` contains server-rendered pages and HTTP endpoints. Each admin page and route independently verifies the role; layout protection is not the only authorization layer.
- `src/lib/domain.ts` and `admin-schema.ts` contain validated business inputs. `server.ts` limits body sizes, hashes tokens, implements request guards, and resolves scoped customer orders.
- `src/components` contains responsive public forms and clean native accessible controls, with React Hook Form for the custom-cake wizard. Recharts renders sales trends.
- `supabase/migrations` holds tables, constraints, RLS and transaction functions. `guest_submissions` makes retries idempotent. Record version checks prevent admin editors from overwriting newer stock/order updates.
- `messaging.ts` maps lifecycle events into click-to-chat templates. PostgreSQL writes an outbox for later workers. The application never sends WhatsApp messages automatically.

Authentication follows the [Supabase server-side client guidance](https://supabase.com/docs/guides/auth/server-side/creating-a-client) and independently validates identity with `getUser()`. Private data access stays in server-only modules, consistent with [Next.js data-security guidance](https://nextjs.org/docs/app/guides/data-security).
