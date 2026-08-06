-- Supabase-only private evidence bucket. All uploads are proxied through the
-- authenticated service API; clients never receive service-role credentials.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'mrv-evidence',
  'mrv-evidence',
  false,
  4194304,
  array['image/jpeg', 'image/png', 'image/heic', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
