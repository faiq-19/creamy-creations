create table public.guest_submissions(id uuid primary key default gen_random_uuid(),key text unique not null,payload_hash text not null,result jsonb not null,created_at timestamptz default now(),updated_at timestamptz default now());
alter table public.guest_submissions enable row level security;
alter function public.submit_request(jsonb) rename to submit_request_core;
create function public.submit_request(d jsonb,upload_hash text) returns jsonb language plpgsql security definer set search_path=public as $$
declare existing guest_submissions; result jsonb; signature text:=encode(digest(d::text,'sha256'),'hex');
begin
perform pg_advisory_xact_lock(hashtextextended(upload_hash,0));
select * into existing from guest_submissions where key=upload_hash;
if found then if existing.payload_hash<>signature then raise exception 'This submission was already saved with different details. Refresh to start a new request.'; end if; return existing.result; end if;
result:=submit_request_core(d);
insert into request_upload_tokens(request_id,token_hash) values((result->>'id')::uuid,upload_hash);
insert into guest_submissions(key,payload_hash,result) values(upload_hash,signature,result);
return result;
end $$;
alter function public.checkout(jsonb,jsonb,text) rename to checkout_core;
create function public.checkout(d jsonb,items jsonb,receipt text) returns jsonb language plpgsql security definer set search_path=public as $$
declare existing guest_submissions; result jsonb; signature text:=encode(digest(d::text||items::text,'sha256'),'hex');
begin
perform pg_advisory_xact_lock(hashtextextended(receipt,0));
select * into existing from guest_submissions where key=receipt;
if found then if existing.payload_hash<>signature then raise exception 'This checkout was already saved with different details. Refresh to start another order.'; end if; return existing.result; end if;
result:=checkout_core(d,items,receipt);
update orders set payment_method=d->>'payment_method' where id=(result->>'id')::uuid;
insert into guest_submissions(key,payload_hash,result) values(receipt,signature,result);
return result;
end $$;
revoke all on function public.submit_request(jsonb,text),public.checkout(jsonb,jsonb,text) from public,anon,authenticated;
grant execute on function public.submit_request(jsonb,text),public.checkout(jsonb,jsonb,text) to service_role;
alter table orders add column payment_method text check(payment_method in ('cash','bank_transfer','raast','easypaisa','jazzcash','other'));
create function public.order_defaults() returns trigger language plpgsql set search_path=public as $$ declare s jsonb; r jsonb; begin
select value into s from business_settings where key='general';
if new.type='custom' then select requirements into r from custom_cake_requests where id=new.request_id; new.capacity_points:=case when coalesce((r->>'tiers')::int,1)>1 then coalesce((s->>'tiered_points')::int,6) else coalesce((s->>'detailed_points')::int,4) end; end if;
return new; end $$;
create trigger apply_order_defaults before insert on orders for each row execute function public.order_defaults();
create index order_items_order on order_items(order_id);
create index addresses_customer on customer_addresses(customer_id);
create index reference_request on custom_request_images(request_id);
create index expenses_date on expenses(date);
create index order_customer on orders(customer_id);
create index notes_order on admin_notes(order_id);
create index notes_request on admin_notes(request_id);
-- Additional audit events are queued for manual messaging adapters.
create function public.payment_received_event() returns trigger language plpgsql set search_path=public as $$ begin insert into notification_events(event,order_id,payload) values(case when new.type='advance' then 'advance_received' else 'payment_received' end,new.order_id,jsonb_build_object('payment_id',new.id,'verified',false)); return new; end $$;
create trigger payment_received after insert on payments for each row execute function public.payment_received_event();
