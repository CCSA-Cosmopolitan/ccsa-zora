-- Run after Drizzle has created the tables.
-- dMRV issuance facts, evidence, telemetry, and audit chains are append-only.

create or replace function public.reject_immutable_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception using
    errcode = '55000',
    message = pg_catalog.format(
      '%I is append-only; %s is not permitted',
      tg_table_name,
      tg_op
    );
end;
$$;

create or replace function public.compute_carbon_event_hash(
  p_certificate_id uuid,
  p_sequence integer,
  p_event_type public.carbon_event_type,
  p_event_at timestamptz,
  p_actor_id uuid,
  p_previous_event_hash text,
  p_payload jsonb
)
returns text
language sql
immutable
strict
set search_path = ''
as $$
  select pg_catalog.encode(
    extensions.digest(
      'ccsa-zora-carbon-v1|' ||
      p_certificate_id::text || '|' ||
      p_sequence::text || '|' ||
      p_event_type::text || '|' ||
      pg_catalog.to_char(
        p_event_at at time zone 'UTC',
        'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'
      ) || '|' ||
      p_actor_id::text || '|' ||
      p_previous_event_hash || '|' ||
      p_payload::text,
      'sha256'
    ),
    'hex'
  );
$$;

create or replace function public.compute_audit_payload_hash(p_payload jsonb)
returns text
language sql
immutable
strict
set search_path = ''
as $$
  select pg_catalog.encode(
    extensions.digest(p_payload::text, 'sha256'),
    'hex'
  );
$$;

create or replace function public.compute_audit_event_hash(
  p_organization_id uuid,
  p_entity_type text,
  p_entity_id uuid,
  p_sequence integer,
  p_action public.audit_action,
  p_actor_id uuid,
  p_occurred_at timestamptz,
  p_previous_event_hash text,
  p_payload_hash text
)
returns text
language sql
immutable
strict
set search_path = ''
as $$
  select pg_catalog.encode(
    extensions.digest(
      'ccsa-zora-audit-v1|' ||
      p_organization_id::text || '|' ||
      p_entity_type || '|' ||
      p_entity_id::text || '|' ||
      p_sequence::text || '|' ||
      p_action::text || '|' ||
      p_actor_id::text || '|' ||
      pg_catalog.to_char(
        p_occurred_at at time zone 'UTC',
        'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'
      ) || '|' ||
      p_previous_event_hash || '|' ||
      p_payload_hash,
      'sha256'
    ),
    'hex'
  );
$$;

create or replace function public.enforce_carbon_event_chain()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  previous_sequence integer;
  previous_hash text;
  expected_event_hash text;
begin
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      'carbon-certificate:' || new.certificate_id::text,
      0
    )
  );

  select e.sequence, e.event_hash
    into previous_sequence, previous_hash
    from public.carbon_certificate_events as e
   where e.certificate_id = new.certificate_id
   order by e.sequence desc
   limit 1;

  if previous_sequence is null then
    if new.sequence <> 1
       or new.event_type <> 'issued'
       or new.previous_event_hash is not null then
      raise exception using
        errcode = '23514',
        message = 'The first certificate event must be issued, sequence 1, with no previous hash';
    end if;
  elsif new.sequence <> previous_sequence + 1
        or new.previous_event_hash is distinct from previous_hash then
    raise exception using
      errcode = '23514',
      message = 'Certificate event sequence or previous hash does not continue the chain';
  end if;

  expected_event_hash := public.compute_carbon_event_hash(
    new.certificate_id,
    new.sequence,
    new.event_type,
    new.event_at,
    new.actor_id,
    coalesce(new.previous_event_hash, 'GENESIS'),
    new.payload
  );

  if new.event_hash is distinct from expected_event_hash then
    raise exception using
      errcode = '23514',
      message = 'Certificate event_hash does not match the canonical event payload';
  end if;

  return new;
end;
$$;

create or replace function public.enforce_audit_event_chain()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  previous_sequence integer;
  previous_hash text;
  lock_key text;
  expected_payload_hash text;
  expected_event_hash text;
begin
  lock_key :=
    'audit:' || new.organization_id::text || ':' ||
    new.entity_type || ':' || new.entity_id::text;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(lock_key, 0)
  );

  select e.sequence, e.event_hash
    into previous_sequence, previous_hash
    from public.audit_events as e
   where e.organization_id = new.organization_id
     and e.entity_type = new.entity_type
     and e.entity_id = new.entity_id
   order by e.sequence desc
   limit 1;

  if previous_sequence is null then
    if new.sequence <> 1 or new.previous_event_hash is not null then
      raise exception using
        errcode = '23514',
        message = 'The first audit event must be sequence 1 with no previous hash';
    end if;
  elsif new.sequence <> previous_sequence + 1
        or new.previous_event_hash is distinct from previous_hash then
    raise exception using
      errcode = '23514',
      message = 'Audit event sequence or previous hash does not continue the chain';
  end if;

  expected_payload_hash := public.compute_audit_payload_hash(new.payload);

  if new.payload_hash is distinct from expected_payload_hash then
    raise exception using
      errcode = '23514',
      message = 'Audit payload_hash does not match the canonical JSONB payload';
  end if;

  expected_event_hash := public.compute_audit_event_hash(
    new.organization_id,
    new.entity_type,
    new.entity_id,
    new.sequence,
    new.action,
    new.actor_id,
    new.occurred_at,
    coalesce(new.previous_event_hash, 'GENESIS'),
    new.payload_hash
  );

  if new.event_hash is distinct from expected_event_hash then
    raise exception using
      errcode = '23514',
      message = 'Audit event_hash does not match the canonical event payload';
  end if;

  return new;
end;
$$;

drop trigger if exists carbon_certificate_events_chain_guard
  on public.carbon_certificate_events;
create trigger carbon_certificate_events_chain_guard
before insert on public.carbon_certificate_events
for each row execute function public.enforce_carbon_event_chain();

drop trigger if exists audit_events_chain_guard on public.audit_events;
create trigger audit_events_chain_guard
before insert on public.audit_events
for each row execute function public.enforce_audit_event_chain();

drop trigger if exists carbon_certificates_immutable
  on public.carbon_certificates;
create trigger carbon_certificates_immutable
before update or delete on public.carbon_certificates
for each row execute function public.reject_immutable_mutation();

drop trigger if exists carbon_certificate_events_immutable
  on public.carbon_certificate_events;
create trigger carbon_certificate_events_immutable
before update or delete on public.carbon_certificate_events
for each row execute function public.reject_immutable_mutation();

drop trigger if exists mrv_evidence_immutable on public.mrv_evidence;
create trigger mrv_evidence_immutable
before update or delete on public.mrv_evidence
for each row execute function public.reject_immutable_mutation();

drop trigger if exists audit_events_immutable on public.audit_events;
create trigger audit_events_immutable
before update or delete on public.audit_events
for each row execute function public.reject_immutable_mutation();

drop trigger if exists sensor_readings_immutable on public.sensor_readings;
create trigger sensor_readings_immutable
before update or delete on public.sensor_readings
for each row execute function public.reject_immutable_mutation();

drop trigger if exists field_indices_immutable on public.field_indices;
create trigger field_indices_immutable
before update or delete on public.field_indices
for each row execute function public.reject_immutable_mutation();

drop trigger if exists advisory_messages_immutable on public.advisory_messages;
create trigger advisory_messages_immutable
before update or delete on public.advisory_messages
for each row execute function public.reject_immutable_mutation();

drop trigger if exists model_runs_immutable on public.model_runs;
create trigger model_runs_immutable
before update or delete on public.model_runs
for each row execute function public.reject_immutable_mutation();

drop trigger if exists sync_receipts_immutable on public.sync_receipts;
create trigger sync_receipts_immutable
before update or delete on public.sync_receipts
for each row execute function public.reject_immutable_mutation();

create or replace view public.current_carbon_certificate_state
with (security_invoker = true)
as
select distinct on (e.certificate_id)
  e.certificate_id,
  e.event_type as current_state,
  e.event_at as state_changed_at,
  e.event_hash,
  e.ledger_network,
  e.ledger_transaction_id
from public.carbon_certificate_events as e
order by e.certificate_id, e.sequence desc;

comment on view public.current_carbon_certificate_state is
  'Read model derived from the latest event in each immutable certificate chain.';

comment on function public.compute_carbon_event_hash is
  'Canonical SHA-256: ccsa-zora-carbon-v1|certificate|sequence|type|UTC time|actor|previous hash or GENESIS|JSONB payload.';

comment on function public.compute_audit_event_hash is
  'Canonical SHA-256: ccsa-zora-audit-v1|organization|entity type|entity|sequence|action|actor|UTC time|previous hash or GENESIS|payload hash.';
