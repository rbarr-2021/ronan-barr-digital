do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'booking_status'
  ) then
    create type public.booking_status as enum (
      'PENDING_REVIEW',
      'READY_FOR_DEPOSIT',
      'CONFIRMED',
      'COMPLETED',
      'CANCELLED',
      'DECLINED'
    );
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'booking_deposit_status'
  ) then
    create type public.booking_deposit_status as enum (
      'NOT_REQUIRED',
      'PENDING',
      'PAID',
      'REFUNDED'
    );
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'booking_source'
  ) then
    create type public.booking_source as enum (
      'WEBSITE',
      'ADMINISTRATOR'
    );
  end if;
end
$$;

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  client_email text not null,
  client_phone text not null,
  treatment_id uuid not null references public.treatments(id) on delete restrict,
  treatment_option_id uuid not null references public.treatment_options(id) on delete restrict,
  requested_date date not null,
  start_time time not null,
  end_time time not null,
  status public.booking_status not null default 'PENDING_REVIEW',
  deposit_status public.booking_deposit_status not null default 'PENDING',
  source public.booking_source not null default 'WEBSITE',
  health_information jsonb not null default '{}'::jsonb,
  additional_notes text,
  admin_notes text,
  proposed_start_time timestamptz,
  proposed_end_time timestamptz,
  slot_locked_until timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint bookings_time_range check (end_time > start_time),
  constraint bookings_proposed_time_range check (
    proposed_start_time is null
    or proposed_end_time is null
    or proposed_end_time > proposed_start_time
  )
);

drop trigger if exists set_bookings_updated_at on public.bookings;
create trigger set_bookings_updated_at
before update on public.bookings
for each row
execute function public.set_updated_at();

create index if not exists bookings_requested_date_idx
  on public.bookings (requested_date, start_time);

create index if not exists bookings_status_idx
  on public.bookings (status, created_at desc);

create index if not exists bookings_slot_locked_until_idx
  on public.bookings (slot_locked_until);

create unique index if not exists bookings_duplicate_request_guard_idx
  on public.bookings (
    lower(client_email),
    treatment_option_id,
    requested_date,
    start_time,
    source
  )
  where status in ('PENDING_REVIEW', 'READY_FOR_DEPOSIT');

create or replace view public.public_booking_reservations as
select
  id,
  treatment_id,
  treatment_option_id,
  requested_date,
  start_time,
  end_time,
  status,
  slot_locked_until,
  created_at,
  updated_at
from public.bookings
where status in ('PENDING_REVIEW', 'READY_FOR_DEPOSIT', 'CONFIRMED')
  and (
    slot_locked_until is null
    or slot_locked_until > timezone('utc', now())
  );

create or replace view public.public_availability_periods as
select
  id,
  start_datetime,
  end_datetime,
  type,
  kind,
  status
from public.availability_exceptions
where status = 'ACTIVE';

grant select, insert on public.bookings to anon;
grant select, insert, update, delete on public.bookings to authenticated;
grant select on public.public_booking_reservations to anon, authenticated;
grant select on public.public_availability_periods to anon, authenticated;

alter table public.bookings enable row level security;

drop policy if exists "public_can_create_booking_requests" on public.bookings;
create policy "public_can_create_booking_requests"
on public.bookings
for insert
to anon
with check (
  source = 'WEBSITE'
  and status = 'PENDING_REVIEW'
  and deposit_status = 'PENDING'
);

drop policy if exists "authenticated_can_manage_bookings" on public.bookings;
create policy "authenticated_can_manage_bookings"
on public.bookings
for all
to authenticated
using (true)
with check (true);
