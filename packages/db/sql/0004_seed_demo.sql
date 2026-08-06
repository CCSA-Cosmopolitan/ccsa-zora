-- Optional non-production dataset. Never run against a production tenant.
do $$
declare
  v_org uuid := '00000000-0000-4000-8000-000000000001';
  v_user uuid := '00000000-0000-4000-8000-000000000010';
begin
  insert into public.organizations (id, name, slug, country_code, created_by)
  values (v_org, 'CCSA Zora Abuja Pilot', 'ccsa-zora-abuja-pilot', 'NG', v_user)
  on conflict (id) do nothing;

  insert into public.organization_members (organization_id, user_id, role)
  values (v_org, v_user, 'owner')
  on conflict do nothing;

  insert into public.farmer_profiles (
    id, organization_id, external_fims_id, display_name, preferred_language,
    community, state_code, consent_version, consented_at, updated_by,
    created_by
  ) values (
    '00000000-0000-4000-8000-000000000201', v_org, 'FIMS-FARMER-001',
    'Amina Bello', 'ha', 'Gwagwalada', 'FC', 'demo-v1', now(), v_user,
    v_user
  ) on conflict (id) do nothing;

  insert into public.fields (
    id, organization_id, primary_farmer_id, external_id, name, boundary,
    area_hectares, crop_code, updated_by, created_by
  ) values
  (
    '00000000-0000-4000-8000-000000000101', v_org,
    '00000000-0000-4000-8000-000000000201', 'NR-MAIZE-01',
    'North Ridge Maize',
    extensions.ST_Multi(extensions.ST_SetSRID(extensions.ST_GeomFromGeoJSON(
      '{"type":"Polygon","coordinates":[[[7.384,9.064],[7.398,9.061],[7.405,9.074],[7.396,9.086],[7.38,9.081],[7.384,9.064]]]}'
    ), 4326)), 42.8, 'MAIZE', v_user, v_user
  ),
  (
    '00000000-0000-4000-8000-000000000102', v_org,
    '00000000-0000-4000-8000-000000000201', 'RB-RICE-01',
    'River Bend Rice',
    extensions.ST_Multi(extensions.ST_SetSRID(extensions.ST_GeomFromGeoJSON(
      '{"type":"Polygon","coordinates":[[[7.415,9.055],[7.428,9.055],[7.431,9.066],[7.418,9.071],[7.412,9.063],[7.415,9.055]]]}'
    ), 4326)), 31.2, 'RICE', v_user, v_user
  ),
  (
    '00000000-0000-4000-8000-000000000103', v_org,
    '00000000-0000-4000-8000-000000000201', 'WB-COWPEA-01',
    'West Block Cowpea',
    extensions.ST_Multi(extensions.ST_SetSRID(extensions.ST_GeomFromGeoJSON(
      '{"type":"Polygon","coordinates":[[[7.347,9.071],[7.362,9.068],[7.368,9.079],[7.358,9.089],[7.345,9.083],[7.347,9.071]]]}'
    ), 4326)), 18.6, 'COWPEA', v_user, v_user
  ) on conflict (id) do nothing;

  insert into public.field_indices (
    organization_id, field_id, index_type, observed_at, value, source,
    content_hash, created_by
  ) values
    (v_org, '00000000-0000-4000-8000-000000000101', 'ndvi', now(), 0.74, 'demo-seed', repeat('a',64), v_user),
    (v_org, '00000000-0000-4000-8000-000000000102', 'ndvi', now(), 0.61, 'demo-seed', repeat('b',64), v_user),
    (v_org, '00000000-0000-4000-8000-000000000103', 'ndvi', now(), 0.52, 'demo-seed', repeat('c',64), v_user)
  on conflict do nothing;

  insert into public.climate_alerts (
    id, organization_id, field_id, alert_type, severity, headline,
    recommendation, valid_from, valid_through, provider, provider_reference,
    payload, created_by
  ) values (
    '00000000-0000-4000-8000-000000000301', v_org,
    '00000000-0000-4000-8000-000000000101', 'heavy_rainfall', 'watch',
    'Rainfall likely within 24 hours',
    'Review fertilizer timing and avoid application when runoff risk is high.',
    now(), now() + interval '24 hours', 'demo-climate-provider',
    'DEMO-RAIN-001', '{"probability":0.78}'::jsonb, v_user
  ) on conflict (id) do nothing;

  insert into public.advisory_sessions (
    id, organization_id, farmer_id, field_id, language, channel, status,
    summary, created_by
  ) values (
    '00000000-0000-4000-8000-000000000401', v_org,
    '00000000-0000-4000-8000-000000000201',
    '00000000-0000-4000-8000-000000000101', 'ha', 'voice', 'active',
    'Maize leaf yellowing triage', v_user
  ) on conflict (id) do nothing;

  insert into public.advisory_messages (
    id, organization_id, session_id, sequence, role, content, confidence,
    knowledge_basis, reasoning_trace_hash, model_metadata
  ) values
  (
    '00000000-0000-4000-8000-000000000411', v_org,
    '00000000-0000-4000-8000-000000000401', 1, 'farmer',
    'Me yasa ganyen masara ta suke zama rawaya?', null, '[]'::jsonb, null,
    '{}'::jsonb
  ),
  (
    '00000000-0000-4000-8000-000000000412', v_org,
    '00000000-0000-4000-8000-000000000401', 2, 'zora',
    'Possible nitrogen deficiency or early foliar stress.', 0.82,
    '["KGML-Ag: maize nutrition","CCSA crop health protocol"]'::jsonb,
    repeat('d', 64),
    '{"name":"zora-kgml-ag-advisor","version":"1.0.0-reference"}'::jsonb
  ) on conflict (id) do nothing;
end $$;
