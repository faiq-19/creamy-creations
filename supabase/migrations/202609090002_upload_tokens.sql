create table public.request_upload_tokens(id uuid primary key default gen_random_uuid(),request_id uuid not null references public.custom_cake_requests,token_hash text unique not null,expires_at timestamptz not null default now()+interval '1 hour',created_at timestamptz default now(),updated_at timestamptz default now());
alter table public.request_upload_tokens enable row level security;
