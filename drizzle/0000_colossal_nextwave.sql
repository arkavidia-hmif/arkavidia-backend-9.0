CREATE TYPE "public"."user_identity_provider_enum" AS ENUM('google', 'basic');--> statement-breakpoint
CREATE TYPE "public"."user_identity_role_enum" AS ENUM('admin', 'admin_competition', 'admin_competition_cp', 'admin_competition_ctf', 'admin_competition_arkalogica', 'admin_competition_datavidia', 'admin_competition_hackvidia', 'admin_competition_uxvidia', 'admin_event', 'admin_event_academya_softeng', 'admin_event_academya_datsci', 'admin_event_academya_uiux', 'admin_event_academya_pm', 'user');--> statement-breakpoint
CREATE TYPE "public"."phase_enum" AS ENUM('pre-eliminary', 'final', 'verification');--> statement-breakpoint
CREATE TYPE "public"."event_team_final_status_enum" AS ENUM('On Review', 'Not Pass', 'Juara 1', 'Juara 2', 'Juara 3');--> statement-breakpoint
CREATE TYPE "public"."event_team_preeliminary_status_enum" AS ENUM('On Review', 'Pass', 'Not Pass');--> statement-breakpoint
CREATE TYPE "public"."event_team_document_type_enum" AS ENUM('submisi-awal');--> statement-breakpoint
CREATE TYPE "public"."event_team_member_document_type_enum" AS ENUM('poster', 'twibbon');--> statement-breakpoint
CREATE TYPE "public"."event_phase_enum" AS ENUM('pre-eliminary', 'final');--> statement-breakpoint
CREATE TYPE "public"."media_bucket_enum" AS ENUM('twibbon', 'poster', 'kartu-identitas', 'bukti-pembayaran', 'submission-cp', 'submission-ctf', 'submission-uxvidia', 'submission-arkalogica', 'submission-hackvidia', 'submission-datavidia', 'twibbon-event', 'poster-event', 'submission-awal-event', 'submission-academya-softeng', 'submission-academya-datsci', 'submission-academya-uiux', 'submission-academya-pm');--> statement-breakpoint
CREATE TYPE "public"."team_member_role_enum" AS ENUM('leader', 'member');--> statement-breakpoint
CREATE TYPE "public"."competition_team_final_status_enum" AS ENUM('On Review', 'Not Pass', 'Juara 1', 'Juara 2', 'Juara 3');--> statement-breakpoint
CREATE TYPE "public"."competition_team_preeliminary_status_enum" AS ENUM('On Review', 'Pass', 'Not Pass');--> statement-breakpoint
CREATE TYPE "public"."team_verification_status_enum" AS ENUM('INCOMPLETE', 'VERIFIED', 'DENIED', 'WAITING', 'CHANGED', 'ON REVIEW');--> statement-breakpoint
CREATE TYPE "public"."user_education_enum" AS ENUM('s1', 's2', 'sma');--> statement-breakpoint
CREATE TYPE "public"."team_document_type_enum" AS ENUM('bukti-pembayaran');--> statement-breakpoint
CREATE TYPE "public"."team_member_document_type_enum" AS ENUM('poster', 'twibbon');--> statement-breakpoint
CREATE TYPE "public"."user_document_type_enum" AS ENUM('nisn', 'kartu-identitas');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_identity" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"provider" "user_identity_provider_enum" NOT NULL,
	"hash" text NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"verification_token" text NOT NULL,
	"verification_token_expiration" timestamp NOT NULL,
	"password_recovery_token" text,
	"password_recovery_token_expiration" timestamp,
	"refresh_token" text,
	"role" "user_identity_role_enum" DEFAULT 'user' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp,
	CONSTRAINT "user_identity_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "competition" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"max_participants" integer NOT NULL,
	"max_team_member" integer NOT NULL,
	"guide_book_url" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "competition_announcement" (
	"id" text PRIMARY KEY NOT NULL,
	"competition_id" text NOT NULL,
	"author_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "competition_submission" (
	"team_id" text NOT NULL,
	"type_id" text NOT NULL,
	"media_id" text,
	"judge_response" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp,
	CONSTRAINT "competition_submission_team_id_type_id_pk" PRIMARY KEY("team_id","type_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "competition_submission_requirement" (
	"type_id" text PRIMARY KEY NOT NULL,
	"competition_id" text NOT NULL,
	"stage" "phase_enum" DEFAULT 'pre-eliminary' NOT NULL,
	"order" integer DEFAULT -1 NOT NULL,
	"type_name" text NOT NULL,
	"description" text NOT NULL,
	"start_date" timestamp NOT NULL,
	"deadline" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "competition_timeline" (
	"id" text PRIMARY KEY NOT NULL,
	"competition_id" text NOT NULL,
	"title" text NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"show_on_landing" boolean DEFAULT false NOT NULL,
	"show_tile" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "event_team_member" (
	"user_id" text NOT NULL,
	"team_id" text NOT NULL,
	"role" "team_member_role_enum" NOT NULL,
	CONSTRAINT "event_team_member_user_id_team_id_pk" PRIMARY KEY("user_id","team_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "event_team" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"team_name" text NOT NULL,
	"stage" "event_phase_enum" DEFAULT 'pre-eliminary' NOT NULL,
	"verification_status" "team_verification_status_enum" DEFAULT 'INCOMPLETE',
	"preeliminary_status" "event_team_preeliminary_status_enum" DEFAULT 'On Review' NOT NULL,
	"final_status" "event_team_final_status_enum" DEFAULT 'On Review' NOT NULL,
	"team_code" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp,
	CONSTRAINT "event_team_team_code_unique" UNIQUE("team_code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "event_team_document" (
	"team_id" text NOT NULL,
	"type" "event_team_document_type_enum" NOT NULL,
	"media_id" text NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"verification_error" text,
	CONSTRAINT "event_team_document_team_id_type_pk" PRIMARY KEY("team_id","type")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "event_team_member_document" (
	"team_id" text NOT NULL,
	"user_id" text NOT NULL,
	"type" "event_team_member_document_type_enum" NOT NULL,
	"media_id" text NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"verification_error" text,
	CONSTRAINT "event_team_member_document_team_id_user_id_type_pk" PRIMARY KEY("team_id","user_id","type")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "event" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"max_participants" integer NOT NULL,
	"max_team_member" integer NOT NULL,
	"guide_book_url" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "event_announcement" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"author_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "event_submission" (
	"team_id" text NOT NULL,
	"type_id" text NOT NULL,
	"media_id" text,
	"judge_response" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp,
	CONSTRAINT "event_submission_team_id_type_id_pk" PRIMARY KEY("team_id","type_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "event_submission_requirement" (
	"type_id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"media_id" text,
	"stage" "event_phase_enum" DEFAULT 'pre-eliminary' NOT NULL,
	"order" integer DEFAULT -1 NOT NULL,
	"type_name" text NOT NULL,
	"description" text NOT NULL,
	"start_date" timestamp NOT NULL,
	"deadline" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "event_timeline" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"title" text NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"show_on_landing" boolean DEFAULT false NOT NULL,
	"show_tile" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "media" (
	"id" text PRIMARY KEY NOT NULL,
	"creator_id" text NOT NULL,
	"name" text NOT NULL,
	"bucket" text NOT NULL,
	"type" text NOT NULL,
	"url" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "media_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "team_member" (
	"user_id" text NOT NULL,
	"team_id" text NOT NULL,
	"role" "team_member_role_enum" NOT NULL,
	CONSTRAINT "team_member_user_id_team_id_pk" PRIMARY KEY("user_id","team_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "team" (
	"id" text PRIMARY KEY NOT NULL,
	"competition_id" text NOT NULL,
	"team_name" text NOT NULL,
	"stage" "phase_enum" DEFAULT 'pre-eliminary' NOT NULL,
	"verification_status" "team_verification_status_enum" DEFAULT 'INCOMPLETE',
	"preeliminary_status" "competition_team_preeliminary_status_enum" DEFAULT 'On Review' NOT NULL,
	"final_status" "competition_team_final_status_enum" DEFAULT 'On Review' NOT NULL,
	"team_code" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp,
	CONSTRAINT "team_team_code_unique" UNIQUE("team_code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"full_name" text,
	"birth_date" date,
	"education" "user_education_enum",
	"entry_source" text,
	"instance" text,
	"phone_number" text,
	"id_line" text,
	"id_discord" text,
	"id_instagram" text,
	"nisn" text,
	"consent" boolean DEFAULT false NOT NULL,
	"real_consent" boolean DEFAULT false NOT NULL,
	"is_registration_complete" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "team_document" (
	"team_id" text NOT NULL,
	"type" "team_document_type_enum" NOT NULL,
	"media_id" text NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"verification_error" text,
	CONSTRAINT "team_document_team_id_type_pk" PRIMARY KEY("team_id","type")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "team_member_document" (
	"team_id" text NOT NULL,
	"user_id" text NOT NULL,
	"type" "team_member_document_type_enum" NOT NULL,
	"media_id" text NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"verification_error" text,
	CONSTRAINT "team_member_document_team_id_user_id_type_pk" PRIMARY KEY("team_id","user_id","type")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_document" (
	"user_id" text NOT NULL,
	"type" "user_document_type_enum" NOT NULL,
	"media_id" text NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"verification_error" text,
	CONSTRAINT "user_document_user_id_type_pk" PRIMARY KEY("user_id","type")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "competition_announcement" ADD CONSTRAINT "competition_announcement_competition_id_competition_id_fk" FOREIGN KEY ("competition_id") REFERENCES "public"."competition"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "competition_announcement" ADD CONSTRAINT "competition_announcement_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "competition_submission" ADD CONSTRAINT "competition_submission_team_id_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "competition_submission" ADD CONSTRAINT "competition_submission_type_id_competition_submission_requirement_type_id_fk" FOREIGN KEY ("type_id") REFERENCES "public"."competition_submission_requirement"("type_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "competition_submission" ADD CONSTRAINT "competition_submission_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "competition_submission_requirement" ADD CONSTRAINT "competition_submission_requirement_competition_id_competition_id_fk" FOREIGN KEY ("competition_id") REFERENCES "public"."competition"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "competition_timeline" ADD CONSTRAINT "competition_timeline_competition_id_competition_id_fk" FOREIGN KEY ("competition_id") REFERENCES "public"."competition"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "event_team_member" ADD CONSTRAINT "event_team_member_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "event_team_member" ADD CONSTRAINT "event_team_member_team_id_event_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."event_team"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "event_team" ADD CONSTRAINT "event_team_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "event_team_document" ADD CONSTRAINT "event_team_document_team_id_event_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."event_team"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "event_team_document" ADD CONSTRAINT "event_team_document_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "event_team_member_document" ADD CONSTRAINT "event_team_member_document_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "event_team_member_document" ADD CONSTRAINT "event_team_member_document_team_id_user_id_event_team_member_team_id_user_id_fk" FOREIGN KEY ("team_id","user_id") REFERENCES "public"."event_team_member"("team_id","user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "event_announcement" ADD CONSTRAINT "event_announcement_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "event_announcement" ADD CONSTRAINT "event_announcement_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "event_submission" ADD CONSTRAINT "event_submission_team_id_event_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."event_team"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "event_submission" ADD CONSTRAINT "event_submission_type_id_event_submission_requirement_type_id_fk" FOREIGN KEY ("type_id") REFERENCES "public"."event_submission_requirement"("type_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "event_submission" ADD CONSTRAINT "event_submission_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "event_submission_requirement" ADD CONSTRAINT "event_submission_requirement_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "event_submission_requirement" ADD CONSTRAINT "event_submission_requirement_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "event_timeline" ADD CONSTRAINT "event_timeline_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "media" ADD CONSTRAINT "media_creator_id_user_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "team_member" ADD CONSTRAINT "team_member_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "team_member" ADD CONSTRAINT "team_member_team_id_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "team" ADD CONSTRAINT "team_competition_id_competition_id_fk" FOREIGN KEY ("competition_id") REFERENCES "public"."competition"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user" ADD CONSTRAINT "user_id_user_identity_id_fk" FOREIGN KEY ("id") REFERENCES "public"."user_identity"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "team_document" ADD CONSTRAINT "team_document_team_id_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "team_document" ADD CONSTRAINT "team_document_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "team_member_document" ADD CONSTRAINT "team_member_document_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "team_member_document" ADD CONSTRAINT "team_member_document_team_id_user_id_team_member_team_id_user_id_fk" FOREIGN KEY ("team_id","user_id") REFERENCES "public"."team_member"("team_id","user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_document" ADD CONSTRAINT "user_document_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_document" ADD CONSTRAINT "user_document_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

