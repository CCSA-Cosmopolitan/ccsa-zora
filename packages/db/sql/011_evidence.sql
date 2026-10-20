BEGIN;
CREATE TABLE IF NOT EXISTS zora_runtime.media (
 storage_key text PRIMARY KEY, account_id uuid NOT NULL REFERENCES zora_runtime.accounts(id),
 sha256 text NOT NULL, mime_type text NOT NULL, content bytea NOT NULL CHECK(octet_length(content)<=4194304),
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT,INSERT ON zora_runtime.media TO zora_runtime_app;
COMMIT;
