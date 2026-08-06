-- Trusted service entry points. These functions are called with a validated
-- actor identity by the Next.js API and keep writes plus audit receipts atomic.

create or replace function public.accept_mobile_observation(
  p_organization_id uuid,
  p_actor_id uuid,
  p_idempotency_key text,
  p_request_id text,
  p_payload jsonb
)
returns table (idempotency_key text, server_version integer, accepted_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_entity_id uuid;
  v_now timestamptz := pg_catalog.clock_timestamp();
  v_payload_hash text;
  v_event_hash text;
begin
  if public.current_app_organization_id() is distinct from p_organization_id
     or public.current_app_user_id() is distinct from p_actor_id
     or not public.is_organization_member(p_organization_id) then
    raise exception using errcode = '42501', message = 'Runtime tenant context is not authorized';
  end if;

  if p_payload->>'organizationId' is distinct from p_organization_id::text then
    raise exception using errcode = '22023', message = 'Payload organization does not match request scope';
  end if;

  select r.idempotency_key, r.server_version, r.accepted_at
    into idempotency_key, server_version, accepted_at
    from public.sync_receipts as r
   where r.organization_id = p_organization_id
     and r.idempotency_key = p_idempotency_key;

  if found then
    return next;
    return;
  end if;

  v_entity_id := (p_payload->>'id')::uuid;
  v_payload_hash := public.compute_audit_payload_hash(p_payload);

  insert into public.observations (
    id,
    organization_id,
    field_id,
    kind,
    status,
    title,
    notes,
    severity,
    observed_at,
    location,
    accuracy_meters,
    device_id,
    idempotency_key,
    payload,
    submitted_at,
    version,
    updated_at,
    updated_by,
    created_at,
    created_by
  ) values (
    v_entity_id,
    p_organization_id,
    (p_payload->>'fieldId')::uuid,
    (p_payload->>'kind')::public.observation_kind,
    coalesce((p_payload->>'status')::public.observation_status, 'draft'),
    p_payload->>'title',
    p_payload->>'notes',
    nullif(p_payload->>'severity', '')::integer,
    (p_payload->>'observedAt')::timestamptz,
    extensions.ST_SetSRID(
      extensions.ST_GeomFromGeoJSON(p_payload->'location'),
      4326
    )::extensions.geometry(Point, 4326),
    nullif(p_payload->>'accuracyMeters', '')::numeric,
    p_payload->>'deviceId',
    p_idempotency_key,
    coalesce(p_payload->'payload', '{}'::jsonb),
    case when p_payload->>'status' = 'submitted' then v_now else null end,
    1,
    v_now,
    p_actor_id,
    v_now,
    p_actor_id
  );

  v_event_hash := public.compute_audit_event_hash(
    p_organization_id,
    'observation',
    v_entity_id,
    1,
    'create',
    p_actor_id,
    v_now,
    'GENESIS',
    v_payload_hash
  );

  insert into public.audit_events (
    organization_id,
    entity_type,
    entity_id,
    sequence,
    action,
    actor_id,
    occurred_at,
    request_id,
    payload,
    previous_event_hash,
    payload_hash,
    event_hash
  ) values (
    p_organization_id,
    'observation',
    v_entity_id,
    1,
    'create',
    p_actor_id,
    v_now,
    p_request_id,
    p_payload,
    null,
    v_payload_hash,
    v_event_hash
  );

  insert into public.sync_receipts (
    organization_id,
    idempotency_key,
    entity_type,
    entity_id,
    server_version,
    payload_hash,
    accepted_at
  ) values (
    p_organization_id,
    p_idempotency_key,
    'observation',
    v_entity_id,
    1,
    v_payload_hash,
    v_now
  );

  idempotency_key := p_idempotency_key;
  server_version := 1;
  accepted_at := v_now;
  return next;
end;
$$;

revoke all on function public.accept_mobile_observation(uuid, uuid, text, text, jsonb)
  from public;
grant execute on function public.accept_mobile_observation(uuid, uuid, text, text, jsonb)
  to zora_app;

comment on function public.accept_mobile_observation is
  'Atomically accepts an idempotent offline observation, creates its genesis audit event, and records a sync receipt.';

create or replace function public.accept_observation_media(
  p_organization_id uuid,
  p_actor_id uuid,
  p_idempotency_key text,
  p_request_id text,
  p_payload jsonb
)
returns table (idempotency_key text, server_version integer, accepted_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_entity_id uuid := (p_payload->>'id')::uuid;
  v_now timestamptz := pg_catalog.clock_timestamp();
  v_payload_hash text;
  v_event_hash text;
begin
  if public.current_app_organization_id() is distinct from p_organization_id
     or public.current_app_user_id() is distinct from p_actor_id
     or not public.is_organization_member(p_organization_id) then
    raise exception using errcode = '42501', message = 'Runtime tenant context is not authorized';
  end if;

  select r.idempotency_key, r.server_version, r.accepted_at
    into idempotency_key, server_version, accepted_at
    from public.sync_receipts as r
   where r.organization_id = p_organization_id
     and r.idempotency_key = p_idempotency_key;
  if found then return next; return; end if;

  v_payload_hash := public.compute_audit_payload_hash(p_payload);

  insert into public.observation_media (
    id, organization_id, observation_id, storage_key, local_uri, mime_type,
    byte_size, sha256, capture_metadata, upload_status, captured_at,
    uploaded_at, created_at, created_by
  ) values (
    v_entity_id, p_organization_id, (p_payload->>'observationId')::uuid,
    p_payload->>'storageKey', null, p_payload->>'mimeType',
    (p_payload->>'byteSize')::bigint, p_payload->>'sha256',
    coalesce(p_payload->'captureMetadata', '{}'::jsonb), 'uploaded',
    (p_payload->>'capturedAt')::timestamptz, v_now, v_now, p_actor_id
  );

  v_event_hash := public.compute_audit_event_hash(
    p_organization_id, 'observation_media', v_entity_id, 1, 'create',
    p_actor_id, v_now, 'GENESIS', v_payload_hash
  );
  insert into public.audit_events (
    organization_id, entity_type, entity_id, sequence, action, actor_id,
    occurred_at, request_id, payload, previous_event_hash, payload_hash, event_hash
  ) values (
    p_organization_id, 'observation_media', v_entity_id, 1, 'create', p_actor_id,
    v_now, p_request_id, p_payload, null, v_payload_hash, v_event_hash
  );
  insert into public.sync_receipts (
    organization_id, idempotency_key, entity_type, entity_id, server_version,
    payload_hash, accepted_at
  ) values (
    p_organization_id, p_idempotency_key, 'observation_media', v_entity_id, 1,
    v_payload_hash, v_now
  );

  idempotency_key := p_idempotency_key;
  server_version := 1;
  accepted_at := v_now;
  return next;
end;
$$;

revoke all on function public.accept_observation_media(uuid, uuid, text, text, jsonb)
  from public;
grant execute on function public.accept_observation_media(uuid, uuid, text, text, jsonb)
  to zora_app;

comment on function public.accept_observation_media is
  'Atomically registers an uploaded evidence object, its audit event, and the mobile sync receipt.';
