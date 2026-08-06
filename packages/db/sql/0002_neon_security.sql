-- Neon tenant isolation for the restricted Vercel runtime role.
-- Create the LOGIN role zora_app in Neon before running this script. Never use
-- neondb_owner in DATABASE_URL; the owner is reserved for DATABASE_URL_UNPOOLED.

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'zora_app') then
    raise exception 'Required Neon runtime role zora_app does not exist'
      using hint = 'Create zora_app as a LOGIN role with no superuser or BYPASSRLS privileges, then rerun db:security.';
  end if;
end
$$;

create or replace function public.current_app_user_id()
returns uuid
language sql
stable
set search_path = ''
as $$
  select nullif(pg_catalog.current_setting('app.user_id', true), '')::uuid;
$$;

create or replace function public.current_app_organization_id()
returns uuid
language sql
stable
set search_path = ''
as $$
  select nullif(pg_catalog.current_setting('app.organization_id', true), '')::uuid;
$$;

create or replace function public.current_app_service()
returns text
language sql
stable
set search_path = ''
as $$
  select nullif(pg_catalog.current_setting('app.service', true), '');
$$;

create or replace function public.is_organization_member(p_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select p_organization_id = public.current_app_organization_id()
     and exists (
       select 1
         from public.organization_members as membership
        where membership.organization_id = p_organization_id
          and membership.user_id = public.current_app_user_id()
     );
$$;

create or replace function public.is_organization_service(
  p_organization_id uuid,
  p_service text
)
returns boolean
language sql
stable
set search_path = ''
as $$
  select p_organization_id = public.current_app_organization_id()
     and p_service = public.current_app_service();
$$;

revoke all on function public.current_app_user_id() from public;
revoke all on function public.current_app_organization_id() from public;
revoke all on function public.current_app_service() from public;
revoke all on function public.is_organization_member(uuid) from public;
revoke all on function public.is_organization_service(uuid, text) from public;
grant execute on function public.current_app_user_id() to zora_app;
grant execute on function public.current_app_organization_id() to zora_app;
grant execute on function public.current_app_service() to zora_app;
grant execute on function public.is_organization_member(uuid) to zora_app;
grant execute on function public.is_organization_service(uuid, text) to zora_app;

create or replace function public.submit_access_request(
  p_full_name text,
  p_email text,
  p_organization_name text,
  p_requested_role text,
  p_country text,
  p_use_case text,
  p_consent_version text,
  p_request_fingerprint text,
  p_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email text := pg_catalog.lower(pg_catalog.btrim(p_email));
  v_request_id uuid;
  v_recent_count integer;
begin
  if pg_catalog.char_length(pg_catalog.btrim(p_full_name)) not between 2 and 120
     or pg_catalog.char_length(v_email) not between 3 and 254
     or pg_catalog.strpos(v_email, '@') < 2
     or pg_catalog.char_length(pg_catalog.btrim(p_organization_name)) not between 2 and 180
     or pg_catalog.char_length(pg_catalog.btrim(p_use_case)) not between 20 and 1200
     or pg_catalog.char_length(p_request_fingerprint) <> 64 then
    raise exception 'invalid_access_request' using errcode = '22023';
  end if;

  select request.id
    into v_request_id
    from public.access_requests as request
   where request.email = v_email
     and request.status = 'pending'::public.access_request_status
   order by request.created_at desc
   limit 1;

  if v_request_id is not null then
    return v_request_id;
  end if;

  select pg_catalog.count(*)::integer
    into v_recent_count
    from public.access_requests as request
   where request.request_fingerprint = p_request_fingerprint
     and request.created_at >= pg_catalog.now() - interval '1 hour';

  if v_recent_count >= 5 then
    raise exception 'access_request_rate_limit' using errcode = 'P0001';
  end if;

  insert into public.access_requests (
    full_name,
    email,
    organization_name,
    requested_role,
    country,
    use_case,
    consent_version,
    request_fingerprint,
    metadata
  ) values (
    pg_catalog.btrim(p_full_name),
    v_email,
    pg_catalog.btrim(p_organization_name),
    p_requested_role,
    nullif(pg_catalog.btrim(p_country), ''),
    pg_catalog.btrim(p_use_case),
    p_consent_version,
    p_request_fingerprint,
    coalesce(p_metadata, '{}'::jsonb)
  )
  on conflict do nothing
  returning id into v_request_id;

  if v_request_id is null then
    select request.id
      into v_request_id
      from public.access_requests as request
     where request.email = v_email
       and request.status = 'pending'::public.access_request_status
     order by request.created_at desc
     limit 1;
  end if;

  return v_request_id;
end;
$$;

revoke all on table public.access_requests from public, zora_app;
revoke all on function public.submit_access_request(text, text, text, text, text, text, text, text, jsonb) from public;
grant execute on function public.submit_access_request(text, text, text, text, text, text, text, text, jsonb) to zora_app;

comment on function public.submit_access_request is
  'Validates, deduplicates, and rate-limits unauthenticated institutional access requests.';

revoke create on schema public from public, zora_app;
grant usage on schema public, extensions to zora_app;
grant select on table
  public.organizations,
  public.organization_members,
  public.farmer_profiles,
  public.fields,
  public.advisory_sessions,
  public.advisory_messages,
  public.climate_alerts,
  public.sensor_nodes,
  public.sensor_readings,
  public.field_indices,
  public.observations,
  public.observation_media,
  public.carbon_certificates,
  public.carbon_certificate_events,
  public.mrv_evidence,
  public.model_runs,
  public.sync_receipts,
  public.audit_events
to zora_app;
grant select on public.current_carbon_certificate_state to zora_app;
grant insert on table public.advisory_sessions, public.advisory_messages, public.model_runs, public.sensor_readings to zora_app;
grant update (last_seen_at, status) on public.sensor_nodes to zora_app;

alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.farmer_profiles enable row level security;
alter table public.fields enable row level security;
alter table public.advisory_sessions enable row level security;
alter table public.advisory_messages enable row level security;
alter table public.climate_alerts enable row level security;
alter table public.sensor_nodes enable row level security;
alter table public.sensor_readings enable row level security;
alter table public.field_indices enable row level security;
alter table public.observations enable row level security;
alter table public.observation_media enable row level security;
alter table public.carbon_certificates enable row level security;
alter table public.carbon_certificate_events enable row level security;
alter table public.mrv_evidence enable row level security;
alter table public.model_runs enable row level security;
alter table public.sync_receipts enable row level security;
alter table public.audit_events enable row level security;

drop policy if exists neon_organizations_select on public.organizations;
create policy neon_organizations_select on public.organizations for select to zora_app
using (public.is_organization_member(id));

drop policy if exists neon_organization_members_select on public.organization_members;
create policy neon_organization_members_select on public.organization_members for select to zora_app
using (public.is_organization_member(organization_id));

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'farmer_profiles', 'fields', 'advisory_sessions', 'advisory_messages',
    'climate_alerts', 'field_indices', 'observations', 'observation_media',
    'carbon_certificates', 'mrv_evidence', 'model_runs', 'sync_receipts',
    'audit_events'
  ]
  loop
    execute format('drop policy if exists neon_tenant_select on public.%I', table_name);
    execute format(
      'create policy neon_tenant_select on public.%I for select to zora_app using (public.is_organization_member(organization_id))',
      table_name
    );
  end loop;
end
$$;

drop policy if exists neon_certificate_events_select on public.carbon_certificate_events;
create policy neon_certificate_events_select on public.carbon_certificate_events for select to zora_app
using (
  exists (
    select 1 from public.carbon_certificates as certificate
     where certificate.id = carbon_certificate_events.certificate_id
       and public.is_organization_member(certificate.organization_id)
  )
);

drop policy if exists neon_sensor_nodes_select on public.sensor_nodes;
create policy neon_sensor_nodes_select on public.sensor_nodes for select to zora_app
using (
  public.is_organization_member(organization_id)
  or public.is_organization_service(organization_id, 'iot')
);

drop policy if exists neon_sensor_nodes_update on public.sensor_nodes;
create policy neon_sensor_nodes_update on public.sensor_nodes for update to zora_app
using (public.is_organization_service(organization_id, 'iot'))
with check (public.is_organization_service(organization_id, 'iot'));

drop policy if exists neon_sensor_readings_select on public.sensor_readings;
create policy neon_sensor_readings_select on public.sensor_readings for select to zora_app
using (
  public.is_organization_member(organization_id)
  or public.is_organization_service(organization_id, 'iot')
);

drop policy if exists neon_sensor_readings_insert on public.sensor_readings;
create policy neon_sensor_readings_insert on public.sensor_readings for insert to zora_app
with check (public.is_organization_service(organization_id, 'iot'));

drop policy if exists neon_advisory_sessions_insert on public.advisory_sessions;
create policy neon_advisory_sessions_insert on public.advisory_sessions for insert to zora_app
with check (
  public.is_organization_member(organization_id)
  and created_by = public.current_app_user_id()
);

drop policy if exists neon_advisory_messages_insert on public.advisory_messages;
create policy neon_advisory_messages_insert on public.advisory_messages for insert to zora_app
with check (public.is_organization_member(organization_id));

drop policy if exists neon_model_runs_insert on public.model_runs;
create policy neon_model_runs_insert on public.model_runs for insert to zora_app
with check (
  public.is_organization_member(organization_id)
  and created_by = public.current_app_user_id()
);

comment on function public.is_organization_member is
  'Neon RLS helper bound to transaction-local app.user_id and app.organization_id settings.';
