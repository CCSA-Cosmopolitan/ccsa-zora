CREATE TYPE "public"."advisory_channel" AS ENUM('web', 'mobile', 'voice', 'extension_assisted');--> statement-breakpoint
CREATE TYPE "public"."advisory_role" AS ENUM('farmer', 'zora', 'extension_officer', 'system');--> statement-breakpoint
CREATE TYPE "public"."advisory_status" AS ENUM('active', 'resolved', 'escalated', 'archived');--> statement-breakpoint
CREATE TYPE "public"."climate_alert_severity" AS ENUM('information', 'watch', 'warning', 'critical');--> statement-breakpoint
CREATE TYPE "public"."zora_language" AS ENUM('en', 'ha', 'yo', 'ig', 'ff');--> statement-breakpoint
CREATE TABLE "advisory_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"session_id" uuid NOT NULL,
	"sequence" integer NOT NULL,
	"role" "advisory_role" NOT NULL,
	"content" text NOT NULL,
	"audio_storage_key" text,
	"media_id" uuid,
	"confidence" numeric(5, 4),
	"knowledge_basis" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"reasoning_trace_hash" text,
	"model_metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "advisory_messages_sequence_chk" CHECK ("advisory_messages"."sequence" > 0),
	CONSTRAINT "advisory_messages_confidence_chk" CHECK ("advisory_messages"."confidence" IS NULL OR ("advisory_messages"."confidence" >= 0 AND "advisory_messages"."confidence" <= 1))
);
--> statement-breakpoint
CREATE TABLE "advisory_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"farmer_id" uuid,
	"field_id" uuid,
	"language" "zora_language" NOT NULL,
	"channel" "advisory_channel" NOT NULL,
	"status" "advisory_status" DEFAULT 'active' NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ended_at" timestamp with time zone,
	"summary" text,
	"context" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	CONSTRAINT "advisory_sessions_end_after_start_chk" CHECK ("advisory_sessions"."ended_at" IS NULL OR "advisory_sessions"."ended_at" >= "advisory_sessions"."started_at")
);
--> statement-breakpoint
CREATE TABLE "climate_alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"field_id" uuid,
	"alert_type" text NOT NULL,
	"severity" "climate_alert_severity" NOT NULL,
	"headline" text NOT NULL,
	"recommendation" text NOT NULL,
	"valid_from" timestamp with time zone NOT NULL,
	"valid_through" timestamp with time zone NOT NULL,
	"provider" text NOT NULL,
	"provider_reference" text,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"acknowledged_at" timestamp with time zone,
	"acknowledged_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	CONSTRAINT "climate_alerts_validity_chk" CHECK ("climate_alerts"."valid_through" > "climate_alerts"."valid_from")
);
--> statement-breakpoint
CREATE TABLE "farmer_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"external_fims_id" text,
	"display_name" text NOT NULL,
	"preferred_language" "zora_language" DEFAULT 'en' NOT NULL,
	"phone_e164_encrypted" text,
	"community" text,
	"state_code" text,
	"consent_version" text,
	"consented_at" timestamp with time zone,
	"active" boolean DEFAULT true NOT NULL,
	"attributes" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	CONSTRAINT "farmer_profiles_consent_pair_chk" CHECK (("farmer_profiles"."consent_version" IS NULL AND "farmer_profiles"."consented_at" IS NULL) OR ("farmer_profiles"."consent_version" IS NOT NULL AND "farmer_profiles"."consented_at" IS NOT NULL))
);
--> statement-breakpoint
ALTER TABLE "fields" ADD COLUMN "primary_farmer_id" uuid;--> statement-breakpoint
ALTER TABLE "advisory_messages" ADD CONSTRAINT "advisory_messages_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "advisory_messages" ADD CONSTRAINT "advisory_messages_session_id_advisory_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."advisory_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "advisory_sessions" ADD CONSTRAINT "advisory_sessions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "advisory_sessions" ADD CONSTRAINT "advisory_sessions_farmer_id_farmer_profiles_id_fk" FOREIGN KEY ("farmer_id") REFERENCES "public"."farmer_profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "advisory_sessions" ADD CONSTRAINT "advisory_sessions_field_id_fields_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."fields"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "climate_alerts" ADD CONSTRAINT "climate_alerts_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "climate_alerts" ADD CONSTRAINT "climate_alerts_field_id_fields_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."fields"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farmer_profiles" ADD CONSTRAINT "farmer_profiles_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "advisory_messages_session_sequence_uidx" ON "advisory_messages" USING btree ("session_id","sequence");--> statement-breakpoint
CREATE INDEX "advisory_messages_org_time_idx" ON "advisory_messages" USING btree ("organization_id","created_at");--> statement-breakpoint
CREATE INDEX "advisory_sessions_org_time_idx" ON "advisory_sessions" USING btree ("organization_id","started_at");--> statement-breakpoint
CREATE INDEX "advisory_sessions_farmer_time_idx" ON "advisory_sessions" USING btree ("farmer_id","started_at");--> statement-breakpoint
CREATE INDEX "advisory_sessions_field_time_idx" ON "advisory_sessions" USING btree ("field_id","started_at");--> statement-breakpoint
CREATE INDEX "climate_alerts_org_validity_idx" ON "climate_alerts" USING btree ("organization_id","valid_from");--> statement-breakpoint
CREATE INDEX "climate_alerts_field_validity_idx" ON "climate_alerts" USING btree ("field_id","valid_from");--> statement-breakpoint
CREATE UNIQUE INDEX "farmer_profiles_org_fims_uidx" ON "farmer_profiles" USING btree ("organization_id","external_fims_id") WHERE "farmer_profiles"."external_fims_id" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "farmer_profiles_org_language_idx" ON "farmer_profiles" USING btree ("organization_id","preferred_language");--> statement-breakpoint
ALTER TABLE "fields" ADD CONSTRAINT "fields_primary_farmer_id_farmer_profiles_id_fk" FOREIGN KEY ("primary_farmer_id") REFERENCES "public"."farmer_profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "fields_primary_farmer_idx" ON "fields" USING btree ("primary_farmer_id");