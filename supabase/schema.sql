-- KEA Operations Suite schema
-- Run this in the Supabase SQL editor.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  name text not null,
  role text not null default 'SUPER_ADMIN',
  role_title text,
  department text,
  initials text,
  avatar_color text default '#92C842',
  assigned_region text default 'All' check (assigned_region in ('All','Lagos','Ibadan','Ogun','Benin')),
  security_clearance text default 'Level 5 (Unrestricted)',
  platform text default 'admin' check (platform in ('admin','vsr')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.staff_records (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  initials text,
  code text not null unique,
  status text not null check (status in ('funded','unfunded','prospective','archived')),
  status_label text,
  region text not null check (region in ('Lagos','Ibadan','Ogun','Benin')),
  location text,
  tenure_months numeric,
  tenure_display text,
  phone text,
  has_loan boolean default false,
  loan_amount numeric,
  loan_label text,
  box_type text,
  box_header_title text,
  box_header_tag text,
  box_highlight_text text,
  allocation_amount numeric,
  bank_name text,
  account_number text,
  verification_status text,
  guarantor_name text,
  pos_count integer,
  archived_reason text,
  archived_date text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.requisitions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  department text not null,
  location text,
  applicant_count integer default 0,
  status text not null default 'active' check (status in ('active','interviewing','offer_out')),
  salary_range text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.funding_logs (
  id uuid primary key default gen_random_uuid(),
  amount_text text not null,
  time text,
  description text,
  type text not null default 'disbursed' check (type in ('disbursed','hold')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.merchandiser_hubs (
  id uuid primary key default gen_random_uuid(),
  hub text not null check (hub in ('Lagos','Ibadan','Ogun','Benin')),
  hub_display_name text not null,
  merchandiser_count integer default 0,
  percentage numeric default 0,
  color_hex text default '#92C842',
  active_pos integer default 0,
  reconciliation_rate numeric default 0,
  shift_start text,
  telemetry_idle_minutes integer default 0,
  is_shift_overrun boolean default false,
  is_idle_breached boolean default false,
  idle_threshold_minutes integer default 30,
  idle_alert_enabled boolean default true,
  overrun_alert_enabled boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.telemetry_preferences (
  id uuid primary key default gen_random_uuid(),
  global_idle_threshold_minutes integer default 30,
  enable_sound_alerts boolean default true,
  alert_throttle_minutes integer default 15,
  hubs jsonb not null default '{"Lagos":{"hub":"Lagos","hubDisplayName":"Lagos","shiftOverrunAlert":true,"idleBreachAlert":true,"idleThresholdMinutes":30},"Ibadan":{"hub":"Ibadan","hubDisplayName":"Ibadan","shiftOverrunAlert":true,"idleBreachAlert":true,"idleThresholdMinutes":30},"Ogun":{"hub":"Ogun","hubDisplayName":"Ogun","shiftOverrunAlert":true,"idleBreachAlert":true,"idleThresholdMinutes":30},"Benin":{"hub":"Benin","hubDisplayName":"Benin","shiftOverrunAlert":true,"idleBreachAlert":true,"idleThresholdMinutes":30}}'::jsonb,
  last_updated_wat text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  detail text,
  time text,
  type text not null default 'info' check (type in ('alert','success','info')),
  unread boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.directives (
  id uuid primary key default gen_random_uuid(),
  staff_record_id uuid references public.staff_records(id) on delete cascade,
  sender text,
  role text,
  text text not null,
  time text,
  is_ops boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vsr_session_logs (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  name text,
  role text,
  city text,
  state text,
  region text,
  country text default 'Nigeria',
  country_code text default 'NG',
  latitude double precision,
  longitude double precision,
  accuracy double precision,
  location_label text,
  timezone text,
  signed_in_at timestamptz not null default now(),
  consent_granted_at timestamptz,
  source text not null default 'browser' check (source in ('browser', 'fallback')),
  created_at timestamptz not null default now()
);

create index if not exists idx_vsr_session_logs_signed_in_at
  on public.vsr_session_logs (signed_in_at desc);

create index if not exists idx_vsr_session_logs_email
  on public.vsr_session_logs (email);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    email,
    name,
    role,
    role_title,
    department,
    initials,
    avatar_color,
    assigned_region,
    security_clearance,
    platform
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    'SUPER_ADMIN',
    'Chief Executive Officer & Managing Director',
    'Executive Governance & Capital Allocations',
    upper(substr(coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)), 1, 2)),
    '#92C842',
    'All',
    'Level 5 (Unrestricted)',
    'admin'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.staff_records enable row level security;
alter table public.requisitions enable row level security;
alter table public.funding_logs enable row level security;
alter table public.merchandiser_hubs enable row level security;
alter table public.telemetry_preferences enable row level security;
alter table public.notifications enable row level security;
alter table public.directives enable row level security;
alter table public.vsr_session_logs enable row level security;

create policy "Profiles are viewable by owner"
  on public.profiles
  for select
  using (auth.uid() = id);

create policy "Profiles are editable by owner"
  on public.profiles
  for update
  using (auth.uid() = id);

create policy "Staff records are readable by authenticated users"
  on public.staff_records
  for select
  using (auth.role() = 'authenticated');

create policy "Requisitions are readable by authenticated users"
  on public.requisitions
  for select
  using (auth.role() = 'authenticated');

create policy "Funding logs are readable by authenticated users"
  on public.funding_logs
  for select
  using (auth.role() = 'authenticated');

create policy "Merchandiser hubs are readable by authenticated users"
  on public.merchandiser_hubs
  for select
  using (auth.role() = 'authenticated');

create policy "Telemetry preferences are readable by authenticated users"
  on public.telemetry_preferences
  for select
  using (auth.role() = 'authenticated');

create policy "Notifications are readable by authenticated users"
  on public.notifications
  for select
  using (auth.role() = 'authenticated');

create policy "Directives are readable by authenticated users"
  on public.directives
  for select
  using (auth.role() = 'authenticated');

create policy "Allow VSR session logs to be inserted by public clients"
  on public.vsr_session_logs
  for insert
  with check (true);

create policy "VSR session logs are readable by authenticated users"
  on public.vsr_session_logs
  for select
  using (auth.role() = 'authenticated');

create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.update_updated_at();

create trigger set_staff_records_updated_at
  before update on public.staff_records
  for each row execute procedure public.update_updated_at();

create trigger set_requisitions_updated_at
  before update on public.requisitions
  for each row execute procedure public.update_updated_at();

create trigger set_funding_logs_updated_at
  before update on public.funding_logs
  for each row execute procedure public.update_updated_at();

create trigger set_merchandiser_hubs_updated_at
  before update on public.merchandiser_hubs
  for each row execute procedure public.update_updated_at();

create trigger set_telemetry_preferences_updated_at
  before update on public.telemetry_preferences
  for each row execute procedure public.update_updated_at();

create trigger set_notifications_updated_at
  before update on public.notifications
  for each row execute procedure public.update_updated_at();

create trigger set_directives_updated_at
  before update on public.directives
  for each row execute procedure public.update_updated_at();
