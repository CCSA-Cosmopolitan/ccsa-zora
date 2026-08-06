-- Supabase-only tenant isolation.
-- Trusted ingestion, certificate issuance, MRV verification, and audit writes
-- use the service role and therefore bypass these client-facing policies.

create or replace function public.is_organization_member(p_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
      from public.organization_members as membership
     where membership.organization_id = p_organization_id
       and membership.user_id = (select auth.uid())
  );
$$;

create or replace function public.has_organization_role(
  p_organization_id uuid,
  p_roles public.organization_role[]
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
      from public.organization_members as membership
     where membership.organization_id = p_organization_id
       and membership.user_id = (select auth.uid())
       and membership.role = any(p_roles)
  );
$$;

revoke all on function public.is_organization_member(uuid) from public;
revoke all on function public.has_organization_role(
  uuid,
  public.organization_role[]
) from public;
grant execute on function public.is_organization_member(uuid)
  to authenticated, service_role;
grant execute on function public.has_organization_role(
  uuid,
  public.organization_role[]
) to authenticated, service_role;

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

drop policy if exists organizations_member_select on public.organizations;
create policy organizations_member_select
on public.organizations
for select
to authenticated
using (public.is_organization_member(id));

drop policy if exists organization_members_member_select
  on public.organization_members;
create policy organization_members_member_select
on public.organization_members
for select
to authenticated
using (public.is_organization_member(organization_id));

drop policy if exists farmer_profiles_member_select on public.farmer_profiles;
create policy farmer_profiles_member_select
on public.farmer_profiles
for select
to authenticated
using (public.is_organization_member(organization_id));

drop policy if exists advisory_sessions_member_select on public.advisory_sessions;
create policy advisory_sessions_member_select
on public.advisory_sessions
for select
to authenticated
using (public.is_organization_member(organization_id));

drop policy if exists advisory_messages_member_select on public.advisory_messages;
create policy advisory_messages_member_select
on public.advisory_messages
for select
to authenticated
using (public.is_organization_member(organization_id));

drop policy if exists climate_alerts_member_select on public.climate_alerts;
create policy climate_alerts_member_select
on public.climate_alerts
for select
to authenticated
using (public.is_organization_member(organization_id));

drop policy if exists fields_member_select on public.fields;
create policy fields_member_select
on public.fields
for select
to authenticated
using (public.is_organization_member(organization_id));

drop policy if exists fields_agronomy_insert on public.fields;
create policy fields_agronomy_insert
on public.fields
for insert
to authenticated
with check (
  public.has_organization_role(
    organization_id,
    array['owner', 'admin', 'agronomist']::public.organization_role[]
  )
  and created_by = (select auth.uid())
  and updated_by = (select auth.uid())
);

drop policy if exists fields_agronomy_update on public.fields;
create policy fields_agronomy_update
on public.fields
for update
to authenticated
using (
  public.has_organization_role(
    organization_id,
    array['owner', 'admin', 'agronomist']::public.organization_role[]
  )
)
with check (
  public.has_organization_role(
    organization_id,
    array['owner', 'admin', 'agronomist']::public.organization_role[]
  )
  and updated_by = (select auth.uid())
);

drop policy if exists sensor_nodes_member_select on public.sensor_nodes;
create policy sensor_nodes_member_select
on public.sensor_nodes
for select
to authenticated
using (public.is_organization_member(organization_id));

drop policy if exists sensor_nodes_agronomy_insert on public.sensor_nodes;
create policy sensor_nodes_agronomy_insert
on public.sensor_nodes
for insert
to authenticated
with check (
  public.has_organization_role(
    organization_id,
    array['owner', 'admin', 'agronomist']::public.organization_role[]
  )
  and created_by = (select auth.uid())
  and updated_by = (select auth.uid())
);

drop policy if exists sensor_nodes_agronomy_update on public.sensor_nodes;
create policy sensor_nodes_agronomy_update
on public.sensor_nodes
for update
to authenticated
using (
  public.has_organization_role(
    organization_id,
    array['owner', 'admin', 'agronomist']::public.organization_role[]
  )
)
with check (
  public.has_organization_role(
    organization_id,
    array['owner', 'admin', 'agronomist']::public.organization_role[]
  )
  and updated_by = (select auth.uid())
);

drop policy if exists sensor_readings_member_select on public.sensor_readings;
create policy sensor_readings_member_select
on public.sensor_readings
for select
to authenticated
using (public.is_organization_member(organization_id));

drop policy if exists observations_member_select on public.observations;
create policy observations_member_select
on public.observations
for select
to authenticated
using (public.is_organization_member(organization_id));

drop policy if exists field_indices_member_select on public.field_indices;
create policy field_indices_member_select
on public.field_indices
for select
to authenticated
using (public.is_organization_member(organization_id));

drop policy if exists observations_field_team_insert on public.observations;
create policy observations_field_team_insert
on public.observations
for insert
to authenticated
with check (
  public.has_organization_role(
    organization_id,
    array[
      'owner',
      'admin',
      'agronomist',
      'field_agent',
      'climate_scientist',
      'verifier'
    ]::public.organization_role[]
  )
  and created_by = (select auth.uid())
  and updated_by = (select auth.uid())
);

drop policy if exists observations_field_team_update on public.observations;
create policy observations_field_team_update
on public.observations
for update
to authenticated
using (
  public.has_organization_role(
    organization_id,
    array[
      'owner',
      'admin',
      'agronomist',
      'field_agent',
      'climate_scientist',
      'verifier'
    ]::public.organization_role[]
  )
  and (
    verified_by is null
    or public.has_organization_role(
      organization_id,
      array['owner', 'admin', 'agronomist', 'verifier']::public.organization_role[]
    )
  )
)
with check (
  public.has_organization_role(
    organization_id,
    array[
      'owner',
      'admin',
      'agronomist',
      'field_agent',
      'climate_scientist',
      'verifier'
    ]::public.organization_role[]
  )
  and updated_by = (select auth.uid())
  and (
    verified_by is null
    or (
      verified_by = (select auth.uid())
      and verified_at is not null
      and public.has_organization_role(
        organization_id,
        array['owner', 'admin', 'agronomist', 'verifier']::public.organization_role[]
      )
    )
  )
);

drop policy if exists observation_media_member_select
  on public.observation_media;
create policy observation_media_member_select
on public.observation_media
for select
to authenticated
using (public.is_organization_member(organization_id));

drop policy if exists observation_media_field_team_insert
  on public.observation_media;
create policy observation_media_field_team_insert
on public.observation_media
for insert
to authenticated
with check (
  public.has_organization_role(
    organization_id,
    array[
      'owner',
      'admin',
      'agronomist',
      'field_agent',
      'climate_scientist'
    ]::public.organization_role[]
  )
  and created_by = (select auth.uid())
);

drop policy if exists observation_media_field_team_update
  on public.observation_media;
create policy observation_media_field_team_update
on public.observation_media
for update
to authenticated
using (
  public.has_organization_role(
    organization_id,
    array[
      'owner',
      'admin',
      'agronomist',
      'field_agent',
      'climate_scientist'
    ]::public.organization_role[]
  )
)
with check (
  public.has_organization_role(
    organization_id,
    array[
      'owner',
      'admin',
      'agronomist',
      'field_agent',
      'climate_scientist'
    ]::public.organization_role[]
  )
  and created_by = (select auth.uid())
);

drop policy if exists carbon_certificates_member_select
  on public.carbon_certificates;
create policy carbon_certificates_member_select
on public.carbon_certificates
for select
to authenticated
using (public.is_organization_member(organization_id));

drop policy if exists carbon_certificate_events_member_select
  on public.carbon_certificate_events;
create policy carbon_certificate_events_member_select
on public.carbon_certificate_events
for select
to authenticated
using (
  exists (
    select 1
      from public.carbon_certificates as certificate
     where certificate.id = carbon_certificate_events.certificate_id
       and public.is_organization_member(certificate.organization_id)
  )
);

drop policy if exists mrv_evidence_member_select on public.mrv_evidence;
create policy mrv_evidence_member_select
on public.mrv_evidence
for select
to authenticated
using (public.is_organization_member(organization_id));

drop policy if exists audit_events_member_select on public.audit_events;
create policy audit_events_member_select
on public.audit_events
for select
to authenticated
using (public.is_organization_member(organization_id));

drop policy if exists model_runs_member_select on public.model_runs;
create policy model_runs_member_select
on public.model_runs
for select
to authenticated
using (public.is_organization_member(organization_id));

drop policy if exists sync_receipts_member_select on public.sync_receipts;
create policy sync_receipts_member_select
on public.sync_receipts
for select
to authenticated
using (public.is_organization_member(organization_id));

comment on function public.is_organization_member is
  'Security-definer helper used by Supabase RLS tenant-read policies.';

comment on function public.has_organization_role is
  'Security-definer helper used by Supabase RLS operational write policies.';
