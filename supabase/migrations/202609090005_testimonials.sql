create table public.testimonials(id uuid primary key default gen_random_uuid(),author text not null,quote text not null,active boolean not null default false,created_at timestamptz default now(),updated_at timestamptz default now());
alter table public.testimonials enable row level security;
create policy admin_read on public.testimonials for select to authenticated using(public.is_admin());
create policy public_reviews on public.testimonials for select to anon,authenticated using(active);
create trigger touch_updated before update on public.testimonials for each row execute function public.touch_updated();
