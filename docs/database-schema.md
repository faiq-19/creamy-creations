# Database schema

The migration is the authoritative schema. UUID keys identify entities; separate sequence-generated year-prefixed numbers identify requests, quotations and orders. Customers are deduplicated by normalized Pakistan mobile number. Products have images and stock; gallery designs remain inspiration. Custom requests retain structured requirements, quotation revisions and reference images. Orders carry direct costs and timestamped state history. Payments and deliveries are separate from cake revenue. Purchases and purchase lines create inventory movements atomically. Settings and daily capacity configure workload. All private tables enforce administrator RLS; service role access is restricted to validated server handlers.

| Area | Tables | Key safeguards |
| --- | --- | --- |
| Identity | profiles, customers, customer_addresses | Admin roles; normalized unique phone; UUID references |
| Storefront | products, product_images, gallery_items, testimonials | Only active public records readable; stock and price constraints |
| Consultation | custom_cake_requests, custom_request_images, quotations, request_upload_tokens | Token hashes, upload expiry, revision/acceptance checks |
| Fulfilment | orders, order_items, order_status_history, deliveries, admin_notes | Verified advance gate; status transition rules; private notes |
| Money | payments, expenses, expense_categories | Verification audit; explicit expense allocation; delivery kept separate |
| Stock | ingredients, suppliers, purchases, purchase_items, inventory_movements | Row locks; weighted costs; nonnegative stock; movement history |
| Operations | daily_capacity, business_settings, notification_events | Configurable point budgets and messaging outbox |
| Abuse/retry control | submission_limits, guest_submissions | Rate windows and transactionally idempotent submissions |

Public-facing human-readable references are generated separately from UUID keys. Customer pages use 256-bit capability tokens, not the human reference, for authorization. A quote token grants access to exactly one quote and its accepted order; a receipt token grants only that order’s summary and proof submission. Neither permits customer/order enumeration or internal-note access.

Core functions: `submit_request`, `checkout`, `create_quote`, `decide_quote`, `review_request`, `verify_payment`, `transition_order`, `record_purchase`, `adjust_inventory`. Privileged functions are executable only by the service role. Administrators read private tables through RLS but mutate through validated server routes.
