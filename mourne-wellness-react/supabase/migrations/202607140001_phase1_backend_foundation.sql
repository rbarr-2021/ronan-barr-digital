create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.business_settings (
  id integer primary key default 1 check (id = 1),
  opening_hours jsonb not null,
  booking_buffer_minutes integer not null check (booking_buffer_minutes >= 0),
  minimum_notice_hours integer not null check (minimum_notice_hours >= 0),
  maximum_booking_days integer not null check (maximum_booking_days > 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.treatments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  duration_minutes integer not null check (duration_minutes > 0),
  price numeric(10, 2) not null check (price >= 0),
  deposit_amount numeric(10, 2) not null check (deposit_amount >= 0),
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'availability_exception_type'
  ) then
    create type public.availability_exception_type as enum ('BOOKING', 'HOLIDAY', 'PERSONAL', 'BREAK', 'OTHER');
  end if;
end
$$;

create table if not exists public.availability_exceptions (
  id uuid primary key default gen_random_uuid(),
  start_datetime timestamptz not null,
  end_datetime timestamptz not null,
  type public.availability_exception_type not null,
  reason text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint availability_exceptions_time_range check (end_datetime > start_datetime)
);

drop trigger if exists set_business_settings_updated_at on public.business_settings;
create trigger set_business_settings_updated_at
before update on public.business_settings
for each row
execute function public.set_updated_at();

drop trigger if exists set_treatments_updated_at on public.treatments;
create trigger set_treatments_updated_at
before update on public.treatments
for each row
execute function public.set_updated_at();

drop trigger if exists set_availability_exceptions_updated_at on public.availability_exceptions;
create trigger set_availability_exceptions_updated_at
before update on public.availability_exceptions
for each row
execute function public.set_updated_at();

insert into public.business_settings (
  id,
  opening_hours,
  booking_buffer_minutes,
  minimum_notice_hours,
  maximum_booking_days
)
values (
  1,
  '{
    "monday": { "open": "10:00", "close": "21:00", "closed": false },
    "tuesday": { "open": "10:00", "close": "21:00", "closed": false },
    "wednesday": { "open": null, "close": null, "closed": true },
    "thursday": { "open": "10:00", "close": "21:00", "closed": false },
    "friday": { "open": "10:00", "close": "16:00", "closed": false },
    "saturday": { "open": "09:00", "close": "13:00", "closed": false },
    "sunday": { "open": null, "close": null, "closed": true }
  }'::jsonb,
  15,
  4,
  90
)
on conflict (id) do update
set
  opening_hours = excluded.opening_hours,
  booking_buffer_minutes = excluded.booking_buffer_minutes,
  minimum_notice_hours = excluded.minimum_notice_hours,
  maximum_booking_days = excluded.maximum_booking_days,
  updated_at = timezone('utc', now());

grant usage on schema public to anon, authenticated;
grant select on public.business_settings to anon, authenticated;
grant select on public.treatments to anon, authenticated;
grant select, insert, update, delete on public.business_settings to authenticated;
grant select, insert, update, delete on public.treatments to authenticated;
grant select, insert, update, delete on public.availability_exceptions to authenticated;

alter table public.business_settings enable row level security;
alter table public.treatments enable row level security;
alter table public.availability_exceptions enable row level security;

drop policy if exists "public_can_read_business_settings" on public.business_settings;
create policy "public_can_read_business_settings"
on public.business_settings
for select
to anon, authenticated
using (true);

drop policy if exists "authenticated_can_manage_business_settings" on public.business_settings;
create policy "authenticated_can_manage_business_settings"
on public.business_settings
for all
to authenticated
using (true)
with check (true);

drop policy if exists "public_can_read_active_treatments" on public.treatments;
create policy "public_can_read_active_treatments"
on public.treatments
for select
to anon, authenticated
using (active = true or auth.role() = 'authenticated');

drop policy if exists "authenticated_can_manage_treatments" on public.treatments;
create policy "authenticated_can_manage_treatments"
on public.treatments
for all
to authenticated
using (true)
with check (true);

drop policy if exists "authenticated_can_manage_availability_exceptions" on public.availability_exceptions;
create policy "authenticated_can_manage_availability_exceptions"
on public.availability_exceptions
for all
to authenticated
using (true)
with check (true);
