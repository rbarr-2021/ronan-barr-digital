alter table public.bookings
  add column if not exists whatsapp_notifications boolean not null default false;

create index if not exists bookings_whatsapp_notifications_idx
  on public.bookings (whatsapp_notifications);
