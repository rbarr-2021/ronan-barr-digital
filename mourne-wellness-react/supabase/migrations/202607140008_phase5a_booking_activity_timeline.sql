create table if not exists public.booking_activity (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  event_type text not null,
  event_title text not null,
  event_description text,
  performed_by text,
  performed_by_type text not null default 'SYSTEM',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  constraint booking_activity_performed_by_type_check check (performed_by_type in ('CUSTOMER', 'ADMIN', 'SYSTEM'))
);

create index if not exists booking_activity_booking_id_idx
  on public.booking_activity (booking_id, created_at desc);

grant select, insert on public.booking_activity to anon, authenticated;

alter table public.booking_activity enable row level security;

drop policy if exists "public_can_create_booking_activity" on public.booking_activity;
create policy "public_can_create_booking_activity"
on public.booking_activity
for insert
to anon
with check (
  event_type = 'BOOKING_REQUESTED'
  and performed_by_type = 'CUSTOMER'
);

drop policy if exists "authenticated_can_read_booking_activity" on public.booking_activity;
create policy "authenticated_can_read_booking_activity"
on public.booking_activity
for select
to authenticated
using (true);

drop policy if exists "authenticated_can_create_booking_activity" on public.booking_activity;
create policy "authenticated_can_create_booking_activity"
on public.booking_activity
for insert
to authenticated
with check (true);

do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'booking_timeline_events'
  ) then
    insert into public.booking_activity (
      booking_id,
      event_type,
      event_title,
      event_description,
      performed_by,
      performed_by_type,
      metadata,
      created_at
    )
    select
      booking_id,
      case event_type
        when 'BOOKING_REQUEST_RECEIVED' then 'BOOKING_REQUESTED'
        when 'DEPOSIT_REQUEST_CANCELLED' then 'DEPOSIT_CANCELLED'
        when 'DEPOSIT_REQUEST_EXPIRED' then 'DEPOSIT_EXPIRED'
        else event_type
      end,
      title,
      description,
      case
        when event_type = 'BOOKING_REQUEST_RECEIVED' then 'Customer'
        else 'System'
      end,
      case
        when event_type = 'BOOKING_REQUEST_RECEIVED' then 'CUSTOMER'
        else 'SYSTEM'
      end,
      metadata,
      created_at
    from public.booking_timeline_events
    where not exists (
      select 1
      from public.booking_activity activity
      where activity.booking_id = booking_timeline_events.booking_id
        and activity.event_type = case booking_timeline_events.event_type
          when 'BOOKING_REQUEST_RECEIVED' then 'BOOKING_REQUESTED'
          when 'DEPOSIT_REQUEST_CANCELLED' then 'DEPOSIT_CANCELLED'
          when 'DEPOSIT_REQUEST_EXPIRED' then 'DEPOSIT_EXPIRED'
          else booking_timeline_events.event_type
        end
        and activity.created_at = booking_timeline_events.created_at
    );
  end if;
end
$$;
