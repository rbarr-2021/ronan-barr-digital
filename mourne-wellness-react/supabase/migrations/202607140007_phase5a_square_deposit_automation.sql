alter table public.bookings
  add column if not exists deposit_amount numeric(10, 2),
  add column if not exists currency text not null default 'GBP',
  add column if not exists square_checkout_id text,
  add column if not exists square_checkout_url text,
  add column if not exists square_order_id text,
  add column if not exists square_payment_id text,
  add column if not exists payment_reference text,
  add column if not exists deposit_requested_at timestamptz,
  add column if not exists deposit_expires_at timestamptz,
  add column if not exists deposit_paid_at timestamptz,
  add column if not exists payment_provider text,
  add column if not exists deposit_request_status text not null default 'NONE';

alter table public.bookings
  drop constraint if exists bookings_deposit_request_status_check;

alter table public.bookings
  add constraint bookings_deposit_request_status_check
  check (deposit_request_status in ('NONE', 'ACTIVE', 'EXPIRED', 'CANCELLED', 'PAID'));

create unique index if not exists bookings_square_checkout_id_idx
  on public.bookings (square_checkout_id)
  where square_checkout_id is not null;

create unique index if not exists bookings_square_order_id_idx
  on public.bookings (square_order_id)
  where square_order_id is not null;

create unique index if not exists bookings_square_payment_id_idx
  on public.bookings (square_payment_id)
  where square_payment_id is not null;

create unique index if not exists bookings_payment_reference_idx
  on public.bookings (payment_reference)
  where payment_reference is not null;

create table if not exists public.booking_timeline_events (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  event_type text not null,
  title text not null,
  description text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists booking_timeline_events_booking_id_idx
  on public.booking_timeline_events (booking_id, created_at desc);

grant select, insert on public.booking_timeline_events to anon, authenticated;

alter table public.booking_timeline_events enable row level security;

drop policy if exists "public_can_create_booking_request_timeline_events" on public.booking_timeline_events;
create policy "public_can_create_booking_request_timeline_events"
on public.booking_timeline_events
for insert
to anon
with check (
  event_type = 'BOOKING_REQUEST_RECEIVED'
);

drop policy if exists "authenticated_can_manage_booking_timeline_events" on public.booking_timeline_events;
create policy "authenticated_can_manage_booking_timeline_events"
on public.booking_timeline_events
for all
to authenticated
using (true)
with check (true);

create table if not exists public.booking_domain_events (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  consumed_at timestamptz
);

create index if not exists booking_domain_events_booking_id_idx
  on public.booking_domain_events (booking_id, created_at desc);

create index if not exists booking_domain_events_event_type_idx
  on public.booking_domain_events (event_type, created_at desc);

grant select on public.booking_domain_events to authenticated;

alter table public.booking_domain_events enable row level security;

drop policy if exists "authenticated_can_read_booking_domain_events" on public.booking_domain_events;
create policy "authenticated_can_read_booking_domain_events"
on public.booking_domain_events
for select
to authenticated
using (true);

create table if not exists public.square_webhook_events (
  id uuid primary key default gen_random_uuid(),
  square_event_id text not null unique,
  event_type text not null,
  booking_id uuid references public.bookings(id) on delete set null,
  square_checkout_id text,
  payload jsonb not null default '{}'::jsonb,
  processed_at timestamptz not null default timezone('utc', now())
);

create index if not exists square_webhook_events_booking_id_idx
  on public.square_webhook_events (booking_id, processed_at desc);

alter table public.square_webhook_events enable row level security;

grant select on public.square_webhook_events to authenticated;

drop policy if exists "authenticated_can_read_square_webhook_events" on public.square_webhook_events;
create policy "authenticated_can_read_square_webhook_events"
on public.square_webhook_events
for select
to authenticated
using (true);
