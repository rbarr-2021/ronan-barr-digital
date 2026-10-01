alter table public.availability_exceptions
  add column if not exists kind text not null default 'BLOCKED_TIME'
    check (kind in ('HOLIDAY', 'PERSONAL_APPOINTMENT', 'LUNCH_BREAK', 'TRAINING', 'MAINTENANCE', 'BLOCKED_TIME', 'OTHER')),
  add column if not exists notes text,
  add column if not exists status text not null default 'ACTIVE'
    check (status in ('ACTIVE', 'INACTIVE'));

update public.availability_exceptions
set
  kind = case type
    when 'HOLIDAY' then 'HOLIDAY'
    when 'PERSONAL' then 'PERSONAL_APPOINTMENT'
    when 'BREAK' then 'LUNCH_BREAK'
    when 'BOOKING' then 'BLOCKED_TIME'
    else 'OTHER'
  end,
  status = coalesce(status, 'ACTIVE')
where kind is null
   or status is null;

create unique index if not exists availability_exceptions_unique_active_idx
  on public.availability_exceptions (start_datetime, end_datetime, type, lower(reason), kind);
