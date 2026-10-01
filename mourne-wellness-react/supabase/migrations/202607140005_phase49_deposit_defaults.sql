alter table public.business_settings
  alter column default_deposit_value set default 20;

update public.business_settings
set
  default_deposit_type = 'fixed',
  default_deposit_value = 20,
  updated_at = timezone('utc', now())
where id = 1
  and coalesce(default_deposit_value, 0) = 0;
