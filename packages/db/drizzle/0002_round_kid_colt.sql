CREATE TYPE "public"."access_request_status" AS ENUM('pending', 'approved', 'declined', 'withdrawn');--> statement-breakpoint
CREATE TABLE "access_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"organization_name" text NOT NULL,
	"requested_role" text NOT NULL,
	"country" text,
	"use_case" text NOT NULL,
	"status" "access_request_status" DEFAULT 'pending' NOT NULL,
	"consent_version" text NOT NULL,
	"consented_at" timestamp with time zone DEFAULT now() NOT NULL,
	"request_fingerprint" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"reviewed_at" timestamp with time zone,
	"reviewed_by" uuid,
	"review_notes" text,
	CONSTRAINT "access_requests_email_normalized_chk" CHECK ("access_requests"."email" = lower("access_requests"."email")),
	CONSTRAINT "access_requests_full_name_length_chk" CHECK (char_length("access_requests"."full_name") between 2 and 120),
	CONSTRAINT "access_requests_use_case_length_chk" CHECK (char_length("access_requests"."use_case") between 20 and 1200)
);
--> statement-breakpoint
CREATE UNIQUE INDEX "access_requests_pending_email_uidx" ON "access_requests" USING btree ("email") WHERE "access_requests"."status" = 'pending'::access_request_status;--> statement-breakpoint
CREATE INDEX "access_requests_status_created_idx" ON "access_requests" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "access_requests_fingerprint_created_idx" ON "access_requests" USING btree ("request_fingerprint","created_at");