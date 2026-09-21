-- pgcrypto is installed in Supabase's trusted extensions schema. These
-- security-definer wrappers hash their idempotency payloads, so include that
-- schema explicitly while keeping application tables resolved from public.
alter function public.submit_request(jsonb, text)
  set search_path = public, extensions;

alter function public.checkout(jsonb, jsonb, text)
  set search_path = public, extensions;

-- Keep the shared trigger function independent of the caller's role-level
-- search path as flagged by the Supabase security advisor.
alter function public.touch_updated()
  set search_path = public;
