-- Additive Neon migration. Does not modify FIMS or legacy Zora records.
BEGIN;
CREATE SCHEMA IF NOT EXISTS zora_runtime;
CREATE TABLE IF NOT EXISTS zora_runtime.accounts (id uuid PRIMARY KEY, subject text NOT NULL UNIQUE, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS zora_runtime.sessions (token_hash text PRIMARY KEY, account_id uuid NOT NULL REFERENCES zora_runtime.accounts(id), expires_at timestamptz NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX IF NOT EXISTS sessions_expiry ON zora_runtime.sessions(expires_at);
CREATE TABLE IF NOT EXISTS zora_runtime.exchanges (assertion_hash text PRIMARY KEY, expires_at timestamptz NOT NULL);
CREATE TABLE IF NOT EXISTS zora_runtime.conversations (id uuid PRIMARY KEY, account_id uuid NOT NULL REFERENCES zora_runtime.accounts(id), language text NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS zora_runtime.messages (id bigserial PRIMARY KEY, conversation_id uuid NOT NULL REFERENCES zora_runtime.conversations(id), role text NOT NULL CHECK(role IN ('user','assistant')), content text NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX IF NOT EXISTS messages_conversation ON zora_runtime.messages(conversation_id,id);
CREATE TABLE IF NOT EXISTS zora_runtime.rate_limits (key text PRIMARY KEY, count integer NOT NULL, expires_at timestamptz NOT NULL);
COMMIT;
