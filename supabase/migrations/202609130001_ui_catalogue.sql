alter table public.gallery_items add column if not exists description text not null default '';
alter table public.gallery_items add column if not exists alt_text text not null default '';
alter table public.product_images add column if not exists alt_text text not null default '';
create index if not exists products_public_category on public.products(category,created_at desc,id) where active;
create index if not exists gallery_public_category on public.gallery_items(category,created_at desc,id) where active;
create index if not exists order_status_created on public.orders(status,created_at desc,id);
create index if not exists requests_status_created on public.custom_cake_requests(status,created_at desc,id);
create or replace function public.dashboard_snapshot(month_start date) returns jsonb language sql stable security definer set search_path=public as $$
with recognized as (select * from orders where status='completed' and completed_at >= month_start::timestamp at time zone 'Asia/Karachi' and completed_at < (month_start+interval '1 month')::timestamp at time zone 'Asia/Karachi'),
sales as(select coalesce(sum(product_subtotal-discount),0) cake,coalesce(sum(product_subtotal-discount-ingredient_cost-decoration_cost-packaging_cost-labour_cost-other_direct_cost),0) gross,coalesce(sum(delivery_fee),0) delivery from recognized),
costs as(select coalesce(sum(actual_cost),0) actual from deliveries where order_id in(select id from recognized)),
operating as(select coalesce(sum(amount),0) expenses from expenses where allocation='operating' and date>=month_start and date<month_start+interval '1 month'),
upcoming as(select o.id,o.number,o.event_date,o.delivery_window,o.status,o.capacity_points,c.name customer from orders o join customers c on c.id=o.customer_id where o.event_date>=(now() at time zone 'Asia/Karachi')::date and o.status not in('completed','cancelled','refunded') order by o.event_date,o.delivery_window limit 10),
trend as(select (completed_at at time zone 'Asia/Karachi')::date as "day",sum(product_subtotal-discount) revenue from recognized group by 1 order by 1),
top as(select i.name,sum(i.quantity) quantity from order_items i join recognized o on o.id=i.order_id group by i.name order by sum(i.quantity) desc limit 5)
select jsonb_build_object('cake',s.cake,'gross',s.gross,'delivery',s.delivery,'actual',c.actual,'expenses',e.expenses,
'new_inquiries',(select count(*) from custom_cake_requests where status='new_inquiry'),
'awaiting_quotes',(select count(*) from quotations where status='sent' and expires_at>now()),
'unverified',(select count(*) from payments where verification_status='pending'),
'deliveries_today',(select count(*) from orders where id in(select order_id from deliveries where method='delivery') and event_date=(now() at time zone 'Asia/Karachi')::date and status not in('cancelled','refunded','completed')),
'low_stock',(select count(*) from ingredients where active and stock<=reorder_level),
'upcoming_count',(select count(*) from orders where event_date between (now() at time zone 'Asia/Karachi')::date and (now() at time zone 'Asia/Karachi')::date+7 and status not in('cancelled','refunded','completed')),
'capacity_warnings',(select count(*) from (select event_date,sum(capacity_points) used from orders where event_date>=(now() at time zone 'Asia/Karachi')::date and status not in('cancelled','refunded','completed') group by event_date) a left join daily_capacity d on d.date=a.event_date where a.used>=coalesce(d.points,(select (value->>'daily_points')::int from business_settings where key='general'),12)*0.8),
'deadlines',(select count(*) from quotations where status='sent' and expires_at between now() and now()+interval '2 days'),
'custom_count',(select count(*) from recognized where type='custom'),'ready_count',(select count(*) from recognized where type='ready'),
'upcoming',coalesce((select jsonb_agg(u) from upcoming u),'[]'::jsonb),'trend',coalesce((select jsonb_agg(t) from trend t),'[]'::jsonb),'top',coalesce((select jsonb_agg(t) from top t),'[]'::jsonb)) from sales s cross join costs c cross join operating e;
$$;
revoke all on function public.dashboard_snapshot(date) from public,anon,authenticated;
grant execute on function public.dashboard_snapshot(date) to service_role;

create or replace function public.customer_summaries(customer_ids uuid[]) returns table(customer_id uuid,order_count bigint,spending numeric,last_order date) language sql stable security definer set search_path=public as $$
select o.customer_id,count(*),coalesce(sum(case when status='completed' then product_subtotal-discount else 0 end),0),max(event_date) from orders o where o.customer_id=any(customer_ids) group by o.customer_id;
$$;
revoke all on function public.customer_summaries(uuid[]) from public,anon,authenticated;
grant execute on function public.customer_summaries(uuid[]) to service_role;
