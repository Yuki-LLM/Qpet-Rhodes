drop policy if exists "Users cancel own pending orders" on public.orders;

create policy "Users cancel own pending orders"
on public.orders for update
using (user_id = auth.uid() and status in ('New Order', 'Preparing'))
with check (user_id = auth.uid() and status = 'Cancelled');
