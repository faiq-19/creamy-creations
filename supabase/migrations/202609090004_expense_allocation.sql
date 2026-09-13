alter table expenses add column allocation text not null default 'operating' check(allocation in ('operating','ingredient_cost','decoration_cost','packaging_cost','labour_cost','other_direct_cost','delivery'));
alter table expenses add constraint order_allocation_required check(allocation='operating' or order_id is not null);
-- Allocated expense entries adjust the order's cost fields in the same transaction.
-- Manually entered order costs must exclude costs already recorded via expenses.
create function public.expense_cost_adjustment() returns trigger language plpgsql set search_path=public as $$
begin
if tg_op='UPDATE' and old.allocation<>'operating' then
 if old.allocation='delivery' then update deliveries set actual_cost=actual_cost-old.amount where order_id=old.order_id;
 else execute format('update public.orders set %I=%I-$1 where id=$2',old.allocation,old.allocation) using old.amount,old.order_id; end if;
end if;
if new.allocation<>'operating' then
 if new.allocation='delivery' then update deliveries set actual_cost=actual_cost+new.amount where order_id=new.order_id; if not found then raise exception 'Order has no delivery record'; end if;
 else execute format('update public.orders set %I=%I+$1 where id=$2',new.allocation,new.allocation) using new.amount,new.order_id; end if;
end if;
return new;
end $$;
create trigger allocate_expense after insert or update on expenses for each row execute function public.expense_cost_adjustment();
