-- Noise reports filed by residents (and through the dashboard chat). Mirrors the
-- Incident type in src/data/mockData.ts; mock incidents are generated in the browser
-- and never stored here.
create table public.incidents (
  id text primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  location text not null,
  district text not null,
  lat double precision not null,
  lng double precision not null,
  description text not null,
  reporter text not null,
  priority text not null check (priority in ('Critical', 'High', 'Moderate', 'Low', 'Pending')),
  status text not null check (status in ('New', 'Verifying', 'Prioritizing', 'Routed', 'Resolved')),
  category text not null,
  event_context text,
  resolution text check (resolution in ('warning', 'fine', 'seizure')),
  sensor_verification jsonb,
  agent_logs jsonb not null default '[]'::jsonb,
  -- Browser tab that made the last change, so a tab can ignore realtime echoes of its own writes.
  updated_by text
);

create index incidents_created_at_idx on public.incidents (created_at desc);

create function public.touch_updated_at() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger incidents_touch_updated_at
before update on public.incidents
for each row execute function public.touch_updated_at();

-- PROTOTYPE ACCESS: there is no login yet, so the public key can read, file and update
-- reports. Lock updates down once the pipeline runs server-side and operators sign in.
alter table public.incidents enable row level security;

grant select, insert, update on public.incidents to anon, authenticated;

create policy "Anyone can read reports"
on public.incidents for select
to anon, authenticated
using (true);

create policy "Anyone can file a new report"
on public.incidents for insert
to anon, authenticated
with check (status = 'New');

create policy "Anyone can update reports (prototype only)"
on public.incidents for update
to anon, authenticated
using (true)
with check (true);

-- Push inserts and updates to subscribed browsers.
alter publication supabase_realtime add table public.incidents;
