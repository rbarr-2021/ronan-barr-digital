alter table public.business_settings
  add column if not exists appointment_gap_minutes integer not null default 0 check (appointment_gap_minutes >= 0),
  add column if not exists default_deposit_type text not null default 'fixed' check (default_deposit_type in ('fixed', 'percentage')),
  add column if not exists default_deposit_value numeric(10, 2) not null default 0 check (default_deposit_value >= 0);

do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'treatment_status'
  ) then
    create type public.treatment_status as enum ('DRAFT', 'ACTIVE', 'INACTIVE');
  end if;
end
$$;

alter table public.treatments
  add column if not exists category text not null default 'General',
  add column if not exists status public.treatment_status not null default 'DRAFT',
  add column if not exists booking_enabled boolean not null default true,
  add column if not exists featured boolean not null default false,
  add column if not exists display_order integer not null default 0 check (display_order >= 0),
  add column if not exists published_at timestamptz,
  add column if not exists created_by uuid,
  add column if not exists updated_by uuid;

update public.treatments
set
  status = case when active then 'ACTIVE'::public.treatment_status else 'INACTIVE'::public.treatment_status end,
  booking_enabled = coalesce(booking_enabled, true),
  featured = coalesce(featured, false),
  display_order = coalesce(display_order, 0)
where status is null
   or booking_enabled is null
   or featured is null
   or display_order is null;

create or replace function public.sync_treatment_system_fields()
returns trigger
language plpgsql
as $$
begin
  new.active = (new.status = 'ACTIVE');

  if tg_op = 'INSERT' then
    if new.status = 'ACTIVE' and new.published_at is null then
      new.published_at = timezone('utc', now());
    end if;
  else
    if old.published_at is not null then
      new.published_at = old.published_at;
    elsif old.status <> 'ACTIVE' and new.status = 'ACTIVE' and new.published_at is null then
      new.published_at = timezone('utc', now());
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists sync_treatment_system_fields on public.treatments;
create trigger sync_treatment_system_fields
before insert or update on public.treatments
for each row
execute function public.sync_treatment_system_fields();

create table if not exists public.treatment_options (
  id uuid primary key default gen_random_uuid(),
  treatment_id uuid not null references public.treatments(id) on delete cascade,
  label text not null,
  duration_minutes integer not null check (duration_minutes > 0),
  price numeric(10, 2) not null check (price >= 0),
  deposit_amount numeric(10, 2) not null default 0 check (deposit_amount >= 0),
  display_order integer not null default 0 check (display_order >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists set_treatment_options_updated_at on public.treatment_options;
create trigger set_treatment_options_updated_at
before update on public.treatment_options
for each row
execute function public.set_updated_at();

create unique index if not exists treatments_name_unique_idx
  on public.treatments (name);

create unique index if not exists treatment_options_treatment_id_label_unique_idx
  on public.treatment_options (treatment_id, label);

grant select, insert, update, delete on public.treatment_options to authenticated;
grant select on public.treatment_options to anon, authenticated;

alter table public.treatment_options enable row level security;

drop policy if exists "public_can_read_active_treatment_options" on public.treatment_options;
create policy "public_can_read_active_treatment_options"
on public.treatment_options
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.treatments
    where treatments.id = treatment_options.treatment_id
      and (treatments.status = 'ACTIVE' or auth.role() = 'authenticated')
  )
);

drop policy if exists "authenticated_can_manage_treatment_options" on public.treatment_options;
create policy "authenticated_can_manage_treatment_options"
on public.treatment_options
for all
to authenticated
using (true)
with check (true);

drop policy if exists "public_can_read_active_treatments" on public.treatments;
create policy "public_can_read_active_treatments"
on public.treatments
for select
to anon, authenticated
using (status = 'ACTIVE' or auth.role() = 'authenticated');

update public.business_settings
set
  appointment_gap_minutes = coalesce(appointment_gap_minutes, 0),
  default_deposit_type = coalesce(default_deposit_type, 'fixed'),
  default_deposit_value = coalesce(default_deposit_value, 0)
where id = 1;

insert into public.treatments (
  name,
  category,
  description,
  duration_minutes,
  price,
  deposit_amount,
  booking_enabled,
  status,
  featured,
  display_order
)
values
  ('Neck, Head, and Face Massage', 'Signature Experiences', 'Melt away tension and restore a natural glow with a calming massage for the neck, head, and face.', 60, 55, 0, true, 'ACTIVE', false, 10),
  ('Back, Neck, and Head with Hot Stone Massage', 'Signature Experiences', 'Release tension and calm the mind with soothing hot stones.', 60, 65, 0, true, 'ACTIVE', false, 20),
  ('Full Body Massage (Lomi Lomi Inspired)', 'Signature Experiences', 'Flowing, rhythmic movements designed to restore balance and relax the body.', 60, 55, 0, true, 'ACTIVE', false, 30),
  ('Full Body Hot Stone Massage', 'Signature Experiences', 'Deep relaxation using heated stones to ease muscle tension.', 70, 70, 0, true, 'ACTIVE', false, 40),
  ('Nurturing Full Body Pregnancy Massage', 'Signature Experiences', 'A soothing massage designed to support relaxation and wellbeing during pregnancy.', 70, 60, 0, true, 'ACTIVE', false, 50),
  ('Therapeutic Deep Tissue Full Body Therapy', 'Specialist Recovery', 'Target deep muscle tension and restore balance. Best for stress and recovery.', 60, 55, 0, true, 'ACTIVE', false, 60),
  ('Sports Massage Therapy', 'Specialist Recovery', 'Focused treatment to ease muscle tension and support recovery.', 60, 55, 0, true, 'ACTIVE', false, 70),
  ('Myofascial Release Therapy', 'Specialist Recovery', 'Restorative treatment to release deep tension and improve mobility.', 60, 55, 0, true, 'ACTIVE', false, 80),
  ('Race Day Reset', 'Specialist Recovery', 'Hot and cold therapy with targeted muscle work for recovery.', 70, 70, 0, true, 'ACTIVE', false, 90),
  ('Mourne Recovery Therapy', 'Signature Treatment', 'A tailored blend of sports massage and myofascial release for full-body reset.', 90, 80, 0, true, 'ACTIVE', false, 100),
  ('Mourne Rocks Retreat & Recovery', 'Signature Treatment', 'A restorative two-hour treatment designed to release muscular tension while nourishing the skin and promoting deep relaxation. This signature experience combines a back sports massage with hot stones to ease tightness and stiffness in the back, shoulders, and neck, together with a Nourishing & Therapeutic Facial using Neal''s Yard Remedies Organic skincare. The facial includes a cleanse, exfoliation, nourishing mask, gentle facial lymphatic drainage, and therapeutic massage to the face, neck, shoulders, and scalp to help reduce puffiness, release tension, and restore a natural glow. Perfect for those seeking both therapeutic bodywork and a deeply relaxing facial experience in the tranquil surroundings of Retreat by the Mournes.', 120, 115, 0, true, 'ACTIVE', true, 110),
  ('Gentle Back, Neck, and Head Massage', 'Nurture & Restore', 'Gentle treatment to ease tension and restore calm.', 60, 55, 0, true, 'ACTIVE', false, 120),
  ('Head & Neck Massage with Essential Oils', 'Nurture & Restore', 'Calming massage to relax the mind and support restful sleep.', 60, 55, 0, true, 'ACTIVE', false, 130),
  ('Nourishing & Therapeutic Facial', 'Nurture & Restore', 'A deeply relaxing facial designed to nourish your skin while easing tension and promoting overall wellbeing. Using Neal''s Yard Remedies Organic skincare, this treatment includes a cleanse, exfoliation, nourishing mask, gentle facial lymphatic drainage, and therapeutic massage to the face, neck, shoulders, and scalp. The extended neck, shoulder, and head massage helps to ease stiffness, release built-up tension, and encourage deep relaxation. Perfect for reducing puffiness, relieving stress, and leaving your skin feeling hydrated, refreshed, and naturally radiant.', 75, 75, 0, true, 'ACTIVE', false, 140),
  ('Tension Release Back Therapy', 'Express Rituals', 'Quick treatment to relieve back, neck, and shoulder tension.', 30, 30, 0, true, 'ACTIVE', false, 150),
  ('Revitalizing Head & Face Massage', 'Express Rituals', 'Relaxing treatment to ease tension and refresh your skin.', 30, 30, 0, true, 'ACTIVE', false, 160),
  ('Grounding Foot Ritual', 'Express Rituals', 'Revives tired feet and restores comfort.', 30, 30, 0, true, 'ACTIVE', false, 170),
  ('Grounding Hand Ritual', 'Express Rituals', 'Relieves tension in hands and wrists.', 30, 30, 0, true, 'ACTIVE', false, 180)
on conflict (name) do update
set
  category = excluded.category,
  description = excluded.description,
  duration_minutes = excluded.duration_minutes,
  price = excluded.price,
  deposit_amount = excluded.deposit_amount,
  booking_enabled = excluded.booking_enabled,
  status = excluded.status,
  featured = excluded.featured,
  display_order = excluded.display_order,
  updated_at = timezone('utc', now());

with seeded_options as (
  select treatments.id as treatment_id, option_data.*
  from public.treatments
  join (
    values
      ('Neck, Head, and Face Massage', '60 min', 60, 55, 0, 10),
      ('Neck, Head, and Face Massage', '90 min', 90, 80, 0, 20),
      ('Back, Neck, and Head with Hot Stone Massage', '60 min', 60, 65, 0, 10),
      ('Full Body Massage (Lomi Lomi Inspired)', '60 min', 60, 55, 0, 10),
      ('Full Body Massage (Lomi Lomi Inspired)', '90 min', 90, 80, 0, 20),
      ('Full Body Hot Stone Massage', '70 min', 70, 70, 0, 10),
      ('Nurturing Full Body Pregnancy Massage', '70 min', 70, 60, 0, 10),
      ('Therapeutic Deep Tissue Full Body Therapy', '60 min', 60, 55, 0, 10),
      ('Therapeutic Deep Tissue Full Body Therapy', '90 min', 90, 80, 0, 20),
      ('Sports Massage Therapy', '60 min', 60, 55, 0, 10),
      ('Sports Massage Therapy', '90 min', 90, 80, 0, 20),
      ('Myofascial Release Therapy', '60 min', 60, 55, 0, 10),
      ('Myofascial Release Therapy', '90 min', 90, 80, 0, 20),
      ('Race Day Reset', '70 min', 70, 70, 0, 10),
      ('Mourne Recovery Therapy', '90 min', 90, 80, 0, 10),
      ('Mourne Rocks Retreat & Recovery', '2 hours', 120, 115, 0, 10),
      ('Gentle Back, Neck, and Head Massage', '60 min', 60, 55, 0, 10),
      ('Head & Neck Massage with Essential Oils', '60 min', 60, 55, 0, 10),
      ('Nourishing & Therapeutic Facial', '75 min', 75, 75, 0, 10),
      ('Tension Release Back Therapy', '30 min', 30, 30, 0, 10),
      ('Revitalizing Head & Face Massage', '30 min', 30, 30, 0, 10),
      ('Grounding Foot Ritual', '30 min', 30, 30, 0, 10),
      ('Grounding Hand Ritual', '30 min', 30, 30, 0, 10)
  ) as option_data(name, label, duration_minutes, price, deposit_amount, display_order)
    on option_data.name = treatments.name
)
insert into public.treatment_options (
  treatment_id,
  label,
  duration_minutes,
  price,
  deposit_amount,
  display_order
)
select
  treatment_id,
  label,
  duration_minutes,
  price,
  deposit_amount,
  display_order
from seeded_options
on conflict (treatment_id, label) do update
set
  duration_minutes = excluded.duration_minutes,
  price = excluded.price,
  deposit_amount = excluded.deposit_amount,
  display_order = excluded.display_order,
  updated_at = timezone('utc', now());
