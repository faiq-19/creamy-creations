create function public.review_request(rid uuid,next_status text,note text,actor uuid) returns void language plpgsql security definer set search_path=public as $$
begin
if next_status not in ('new_inquiry','under_review','rejected') then raise exception 'Invalid inquiry status'; end if;
perform 1 from custom_cake_requests where id=rid for update;
if not found then raise exception 'Request not found'; end if;
if exists(select 1 from orders where request_id=rid) then raise exception 'This inquiry has an order. Manage it from Orders.'; end if;
update custom_cake_requests set status=next_status where id=rid;
if next_status='rejected' then update quotations set status='rejected' where request_id=rid and status in ('sent','draft'); end if;
if length(trim(coalesce(note,'')))>0 then insert into admin_notes(request_id,note,administrator) values(rid,note,actor); end if;
end $$;
revoke all on function public.review_request(uuid,text,text,uuid) from public,anon,authenticated;
grant execute on function public.review_request(uuid,text,text,uuid) to service_role;
