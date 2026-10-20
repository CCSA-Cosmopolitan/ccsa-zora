BEGIN;
CREATE TABLE IF NOT EXISTS zora_runtime.phone_verifications (
 phone_hash text PRIMARY KEY, pin_id text NOT NULL, expires_at timestamptz NOT NULL
);
GRANT SELECT,INSERT,UPDATE,DELETE ON zora_runtime.phone_verifications TO zora_runtime_app;
COMMIT;
