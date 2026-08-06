CREATE TYPE "public"."audit_action" AS ENUM('create', 'update', 'archive', 'submit', 'verify', 'reject', 'sync');--> statement-breakpoint
CREATE TYPE "public"."carbon_event_type" AS ENUM('issued', 'transferred', 'retired', 'revoked', 'corrective_note');--> statement-breakpoint
CREATE TYPE "public"."carbon_standard" AS ENUM('verra_vcs', 'gold_standard', 'art_trees', 'internal_scope3', 'other');--> statement-breakpoint
CREATE TYPE "public"."mrv_evidence_type" AS ENUM('field_observation', 'sensor_reading', 'satellite_scene', 'model_run', 'lab_result', 'verifier_attestation');--> statement-breakpoint
CREATE TYPE "public"."field_status" AS ENUM('active', 'fallow', 'retired');--> statement-breakpoint
CREATE TYPE "public"."media_upload_status" AS ENUM('local', 'queued', 'uploaded', 'failed');--> statement-breakpoint
CREATE TYPE "public"."model_run_status" AS ENUM('started', 'completed', 'failed', 'superseded');--> statement-breakpoint
CREATE TYPE "public"."observation_kind" AS ENUM('crop_health', 'pest_disease', 'soil', 'water', 'weather_damage', 'practice_evidence', 'yield', 'other');--> statement-breakpoint
CREATE TYPE "public"."observation_status" AS ENUM('draft', 'submitted', 'verified', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."organization_role" AS ENUM('owner', 'admin', 'agronomist', 'field_agent', 'climate_scientist', 'verifier', 'viewer');--> statement-breakpoint
CREATE TYPE "public"."sensor_connectivity" AS ENUM('lorawan', 'nb_iot', 'cellular', 'wifi', 'bluetooth', 'manual');--> statement-breakpoint
CREATE TYPE "public"."sensor_status" AS ENUM('provisioning', 'active', 'degraded', 'offline', 'retired');--> statement-breakpoint
CREATE TABLE "audit_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" uuid NOT NULL,
	"sequence" integer NOT NULL,
	"action" "audit_action" NOT NULL,
	"actor_id" uuid NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL,
	"request_id" text NOT NULL,
	"payload" jsonb NOT NULL,
	"previous_event_hash" text,
	"payload_hash" text NOT NULL,
	"event_hash" text NOT NULL,
	"signature" text,
	"signing_key_id" text,
	"recorded_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "audit_events_sequence_chk" CHECK ("audit_events"."sequence" > 0)
);
--> statement-breakpoint
CREATE TABLE "carbon_certificate_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"certificate_id" uuid NOT NULL,
	"sequence" integer NOT NULL,
	"event_type" "carbon_event_type" NOT NULL,
	"event_at" timestamp with time zone NOT NULL,
	"actor_id" uuid NOT NULL,
	"payload" jsonb NOT NULL,
	"previous_event_hash" text,
	"event_hash" text NOT NULL,
	"signature" text,
	"signing_key_id" text,
	"ledger_network" text,
	"ledger_transaction_id" text,
	"recorded_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "carbon_certificate_events_sequence_chk" CHECK ("carbon_certificate_events"."sequence" > 0),
	CONSTRAINT "carbon_certificate_events_hash_chain_chk" CHECK ("carbon_certificate_events"."previous_event_hash" IS NULL OR "carbon_certificate_events"."previous_event_hash" <> "carbon_certificate_events"."event_hash")
);
--> statement-breakpoint
CREATE TABLE "carbon_certificates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"field_id" uuid,
	"standard" "carbon_standard" NOT NULL,
	"methodology_code" text NOT NULL,
	"registry_serial" text NOT NULL,
	"vintage_start" timestamp with time zone NOT NULL,
	"vintage_end" timestamp with time zone NOT NULL,
	"quantity_tco2e" numeric(20, 6) NOT NULL,
	"issued_at" timestamp with time zone NOT NULL,
	"evidence_merkle_root" text NOT NULL,
	"issuance_document_hash" text NOT NULL,
	"registry_url" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	CONSTRAINT "carbon_certificates_vintage_chk" CHECK ("carbon_certificates"."vintage_end" >= "carbon_certificates"."vintage_start"),
	CONSTRAINT "carbon_certificates_quantity_chk" CHECK ("carbon_certificates"."quantity_tco2e" > 0)
);
--> statement-breakpoint
CREATE TABLE "field_indices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"field_id" uuid NOT NULL,
	"index_type" text NOT NULL,
	"observed_at" timestamp with time zone NOT NULL,
	"value" numeric(12, 8) NOT NULL,
	"cloud_cover_percent" numeric(6, 3),
	"source" text NOT NULL,
	"scene_reference" text,
	"content_hash" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	CONSTRAINT "field_indices_cloud_cover_chk" CHECK ("field_indices"."cloud_cover_percent" IS NULL OR "field_indices"."cloud_cover_percent" BETWEEN 0 AND 100)
);
--> statement-breakpoint
CREATE TABLE "fields" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"external_id" text,
	"name" text NOT NULL,
	"status" "field_status" DEFAULT 'active' NOT NULL,
	"boundary" extensions.geometry(MultiPolygon,4326) NOT NULL,
	"area_hectares" numeric(14, 4) NOT NULL,
	"crop_code" text,
	"soil_profile" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"properties" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid NOT NULL,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	CONSTRAINT "fields_area_positive_chk" CHECK ("fields"."area_hectares" > 0),
	CONSTRAINT "fields_version_positive_chk" CHECK ("fields"."version" > 0),
	CONSTRAINT "fields_boundary_valid_chk" CHECK (extensions.ST_SRID("fields"."boundary") = 4326 AND extensions.ST_IsValid("fields"."boundary"))
);
--> statement-breakpoint
CREATE TABLE "model_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"field_id" uuid NOT NULL,
	"model_name" text NOT NULL,
	"model_version" text NOT NULL,
	"artifact_hash" text NOT NULL,
	"input_hash" text NOT NULL,
	"evidence_merkle_root" text NOT NULL,
	"status" "model_run_status" NOT NULL,
	"outputs" jsonb NOT NULL,
	"uncertainty" jsonb NOT NULL,
	"constraints" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mrv_evidence" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"certificate_id" uuid NOT NULL,
	"field_id" uuid,
	"evidence_type" "mrv_evidence_type" NOT NULL,
	"source_entity_id" uuid,
	"storage_key" text,
	"content_hash" text NOT NULL,
	"captured_at" timestamp with time zone NOT NULL,
	"provenance" jsonb NOT NULL,
	"verified_at" timestamp with time zone,
	"verified_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "observation_media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"observation_id" uuid NOT NULL,
	"storage_key" text,
	"local_uri" text,
	"mime_type" text NOT NULL,
	"byte_size" bigint NOT NULL,
	"sha256" text NOT NULL,
	"capture_metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"upload_status" "media_upload_status" DEFAULT 'local' NOT NULL,
	"captured_at" timestamp with time zone NOT NULL,
	"uploaded_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	CONSTRAINT "observation_media_byte_size_chk" CHECK ("observation_media"."byte_size" > 0),
	CONSTRAINT "observation_media_location_chk" CHECK ("observation_media"."storage_key" IS NOT NULL OR "observation_media"."local_uri" IS NOT NULL)
);
--> statement-breakpoint
CREATE TABLE "observations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"field_id" uuid NOT NULL,
	"kind" "observation_kind" NOT NULL,
	"status" "observation_status" DEFAULT 'draft' NOT NULL,
	"title" text NOT NULL,
	"notes" text,
	"severity" integer,
	"observed_at" timestamp with time zone NOT NULL,
	"location" extensions.geometry(Point,4326) NOT NULL,
	"accuracy_meters" numeric(10, 2),
	"device_id" text NOT NULL,
	"idempotency_key" text NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"submitted_at" timestamp with time zone,
	"verified_at" timestamp with time zone,
	"verified_by" uuid,
	"version" integer DEFAULT 1 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	CONSTRAINT "observations_severity_chk" CHECK ("observations"."severity" IS NULL OR "observations"."severity" BETWEEN 1 AND 5),
	CONSTRAINT "observations_verification_chk" CHECK ("observations"."status" <> 'verified' OR ("observations"."verified_at" IS NOT NULL AND "observations"."verified_by" IS NOT NULL)),
	CONSTRAINT "observations_version_positive_chk" CHECK ("observations"."version" > 0)
);
--> statement-breakpoint
CREATE TABLE "organization_members" (
	"organization_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "organization_role" NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	"invited_by" uuid,
	CONSTRAINT "organization_members_pk" PRIMARY KEY("organization_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"country_code" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	CONSTRAINT "organizations_country_code_chk" CHECK ("organizations"."country_code" IS NULL OR char_length("organizations"."country_code") = 2)
);
--> statement-breakpoint
CREATE TABLE "sensor_nodes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"field_id" uuid,
	"hardware_id" text NOT NULL,
	"display_name" text NOT NULL,
	"manufacturer" text,
	"model" text,
	"firmware_version" text,
	"connectivity" "sensor_connectivity" NOT NULL,
	"status" "sensor_status" DEFAULT 'provisioning' NOT NULL,
	"location" extensions.geometry(Point,4326) NOT NULL,
	"capabilities" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"mqtt_topic" text,
	"last_seen_at" timestamp with time zone,
	"commissioned_at" timestamp with time zone,
	"retired_at" timestamp with time zone,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	CONSTRAINT "sensor_nodes_location_valid_chk" CHECK (extensions.ST_SRID("sensor_nodes"."location") = 4326 AND extensions.ST_IsValid("sensor_nodes"."location"))
);
--> statement-breakpoint
CREATE TABLE "sensor_readings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"sensor_node_id" uuid NOT NULL,
	"observed_at" timestamp with time zone NOT NULL,
	"ingested_at" timestamp with time zone DEFAULT now() NOT NULL,
	"metric" text NOT NULL,
	"value" numeric(20, 8) NOT NULL,
	"unit" text NOT NULL,
	"quality_flag" text DEFAULT 'unreviewed' NOT NULL,
	"sequence_number" bigint,
	"payload_hash" text NOT NULL,
	"raw_payload" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sync_receipts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"idempotency_key" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" uuid NOT NULL,
	"server_version" integer NOT NULL,
	"payload_hash" text NOT NULL,
	"accepted_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sync_receipts_server_version_chk" CHECK ("sync_receipts"."server_version" > 0)
);
--> statement-breakpoint
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carbon_certificate_events" ADD CONSTRAINT "carbon_certificate_events_certificate_id_carbon_certificates_id_fk" FOREIGN KEY ("certificate_id") REFERENCES "public"."carbon_certificates"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carbon_certificates" ADD CONSTRAINT "carbon_certificates_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carbon_certificates" ADD CONSTRAINT "carbon_certificates_field_id_fields_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."fields"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "field_indices" ADD CONSTRAINT "field_indices_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "field_indices" ADD CONSTRAINT "field_indices_field_id_fields_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."fields"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fields" ADD CONSTRAINT "fields_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model_runs" ADD CONSTRAINT "model_runs_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model_runs" ADD CONSTRAINT "model_runs_field_id_fields_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."fields"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mrv_evidence" ADD CONSTRAINT "mrv_evidence_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mrv_evidence" ADD CONSTRAINT "mrv_evidence_certificate_id_carbon_certificates_id_fk" FOREIGN KEY ("certificate_id") REFERENCES "public"."carbon_certificates"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mrv_evidence" ADD CONSTRAINT "mrv_evidence_field_id_fields_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."fields"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "observation_media" ADD CONSTRAINT "observation_media_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "observation_media" ADD CONSTRAINT "observation_media_observation_id_observations_id_fk" FOREIGN KEY ("observation_id") REFERENCES "public"."observations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "observations" ADD CONSTRAINT "observations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "observations" ADD CONSTRAINT "observations_field_id_fields_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."fields"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sensor_nodes" ADD CONSTRAINT "sensor_nodes_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sensor_nodes" ADD CONSTRAINT "sensor_nodes_field_id_fields_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."fields"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sensor_readings" ADD CONSTRAINT "sensor_readings_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sensor_readings" ADD CONSTRAINT "sensor_readings_sensor_node_id_sensor_nodes_id_fk" FOREIGN KEY ("sensor_node_id") REFERENCES "public"."sensor_nodes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sync_receipts" ADD CONSTRAINT "sync_receipts_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "audit_events_entity_sequence_uidx" ON "audit_events" USING btree ("organization_id","entity_type","entity_id","sequence");--> statement-breakpoint
CREATE UNIQUE INDEX "audit_events_hash_uidx" ON "audit_events" USING btree ("event_hash");--> statement-breakpoint
CREATE INDEX "audit_events_entity_timeline_idx" ON "audit_events" USING btree ("entity_type","entity_id","occurred_at");--> statement-breakpoint
CREATE INDEX "audit_events_request_idx" ON "audit_events" USING btree ("request_id");--> statement-breakpoint
CREATE UNIQUE INDEX "carbon_certificate_events_sequence_uidx" ON "carbon_certificate_events" USING btree ("certificate_id","sequence");--> statement-breakpoint
CREATE UNIQUE INDEX "carbon_certificate_events_hash_uidx" ON "carbon_certificate_events" USING btree ("event_hash");--> statement-breakpoint
CREATE INDEX "carbon_certificate_events_timeline_idx" ON "carbon_certificate_events" USING btree ("certificate_id","event_at");--> statement-breakpoint
CREATE UNIQUE INDEX "carbon_certificates_standard_serial_uidx" ON "carbon_certificates" USING btree ("standard","registry_serial");--> statement-breakpoint
CREATE INDEX "carbon_certificates_org_vintage_idx" ON "carbon_certificates" USING btree ("organization_id","vintage_start");--> statement-breakpoint
CREATE INDEX "carbon_certificates_field_idx" ON "carbon_certificates" USING btree ("field_id");--> statement-breakpoint
CREATE UNIQUE INDEX "field_indices_field_type_time_uidx" ON "field_indices" USING btree ("field_id","index_type","observed_at");--> statement-breakpoint
CREATE INDEX "field_indices_org_time_idx" ON "field_indices" USING btree ("organization_id","observed_at");--> statement-breakpoint
CREATE UNIQUE INDEX "fields_org_external_id_uidx" ON "fields" USING btree ("organization_id","external_id") WHERE "fields"."external_id" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "fields_organization_idx" ON "fields" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "fields_boundary_gist_idx" ON "fields" USING gist ("boundary");--> statement-breakpoint
CREATE UNIQUE INDEX "model_runs_input_model_uidx" ON "model_runs" USING btree ("field_id","model_version","input_hash");--> statement-breakpoint
CREATE INDEX "model_runs_org_time_idx" ON "model_runs" USING btree ("organization_id","started_at");--> statement-breakpoint
CREATE INDEX "model_runs_evidence_root_idx" ON "model_runs" USING btree ("evidence_merkle_root");--> statement-breakpoint
CREATE UNIQUE INDEX "mrv_evidence_certificate_hash_uidx" ON "mrv_evidence" USING btree ("certificate_id","content_hash");--> statement-breakpoint
CREATE INDEX "mrv_evidence_field_time_idx" ON "mrv_evidence" USING btree ("field_id","captured_at");--> statement-breakpoint
CREATE UNIQUE INDEX "observation_media_sha_uidx" ON "observation_media" USING btree ("observation_id","sha256");--> statement-breakpoint
CREATE INDEX "observation_media_observation_idx" ON "observation_media" USING btree ("observation_id");--> statement-breakpoint
CREATE UNIQUE INDEX "observations_org_idempotency_uidx" ON "observations" USING btree ("organization_id","idempotency_key");--> statement-breakpoint
CREATE INDEX "observations_field_time_idx" ON "observations" USING btree ("field_id","observed_at");--> statement-breakpoint
CREATE INDEX "observations_location_gist_idx" ON "observations" USING gist ("location");--> statement-breakpoint
CREATE INDEX "organization_members_user_idx" ON "organization_members" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "organizations_slug_uidx" ON "organizations" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "sensor_nodes_org_hardware_uidx" ON "sensor_nodes" USING btree ("organization_id","hardware_id");--> statement-breakpoint
CREATE INDEX "sensor_nodes_field_idx" ON "sensor_nodes" USING btree ("field_id");--> statement-breakpoint
CREATE INDEX "sensor_nodes_location_gist_idx" ON "sensor_nodes" USING gist ("location");--> statement-breakpoint
CREATE INDEX "sensor_readings_node_time_idx" ON "sensor_readings" USING btree ("sensor_node_id","observed_at");--> statement-breakpoint
CREATE INDEX "sensor_readings_org_metric_time_idx" ON "sensor_readings" USING btree ("organization_id","metric","observed_at");--> statement-breakpoint
CREATE UNIQUE INDEX "sensor_readings_payload_hash_uidx" ON "sensor_readings" USING btree ("sensor_node_id","payload_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "sync_receipts_org_idempotency_uidx" ON "sync_receipts" USING btree ("organization_id","idempotency_key");--> statement-breakpoint
CREATE INDEX "sync_receipts_entity_idx" ON "sync_receipts" USING btree ("entity_type","entity_id");
