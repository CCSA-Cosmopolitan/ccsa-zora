-- Run before the first Drizzle migration.
-- Supabase commonly pre-creates the extensions schema; this remains portable.
create schema if not exists extensions;
create extension if not exists postgis with schema extensions;
create extension if not exists pgcrypto with schema extensions;

comment on extension postgis is
  'PostGIS geometry support for WGS84 fields, sensor nodes, and observations.';
