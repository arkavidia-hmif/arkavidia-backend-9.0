CREATE TYPE "public"."user_identity_provider_enum" AS ENUM('google', 'basic');--> statement-breakpoint
CREATE TYPE "public"."user_identity_role_enum" AS ENUM('admin', 'user');--> statement-breakpoint
CREATE TYPE "public"."phase_enum" AS ENUM('pre-eliminary', 'final', 'verification');--> statement-breakpoint
CREATE TYPE "public"."media_bucket_enum" AS ENUM('twibbon', 'poster', 'kartu-identitas', 'bukti-pembayaran', 'submission-cp', 'submission-ctf', 'submission-uxvidia', 'submission-arkalogica', 'submission-hackvidia', 'submission-datavidia');--> statement-breakpoint
CREATE TYPE "public"."team_member_role_renum" AS ENUM('leader', 'member');--> statement-breakpoint
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
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"team_id" text NOT NULL,
	"role" "team_member_role_renum" NOT NULL,
	"nisn_media_id" text,
	"kartu_media_id" text,
	"poster_media_id" text,
	"twibbon_media_id" text,
	"is_verified" boolean DEFAULT false NOT NULL,
	"verification_error" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "team" (
	"id" text PRIMARY KEY NOT NULL,
	"competition_id" text NOT NULL,
	"team_name" text NOT NULL,
	"team_code" text NOT NULL,
	"payment_proof_media_id" text,
	"is_verified" boolean DEFAULT false NOT NULL,
	"verification_error" text,
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
	"consent" boolean DEFAULT false NOT NULL,
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
	"team_member_id" text NOT NULL,
	"type" "team_member_document_type_enum" NOT NULL,
	"media_id" text NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"verification_error" text,
	CONSTRAINT "team_member_document_team_member_id_type_pk" PRIMARY KEY("team_member_id","type")
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
 ALTER TABLE "competition_submission" ADD CONSTRAINT "competition_submission_team_id_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "competition_submission" ADD CONSTRAINT "competition_submission_type_id_competition_submission_requirement_type_id_fk" FOREIGN KEY ("type_id") REFERENCES "public"."competition_submission_requirement"("type_id") ON DELETE no action ON UPDATE no action;
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
 ALTER TABLE "team_member" ADD CONSTRAINT "team_member_nisn_media_id_media_id_fk" FOREIGN KEY ("nisn_media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "team_member" ADD CONSTRAINT "team_member_kartu_media_id_media_id_fk" FOREIGN KEY ("kartu_media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "team_member" ADD CONSTRAINT "team_member_poster_media_id_media_id_fk" FOREIGN KEY ("poster_media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "team_member" ADD CONSTRAINT "team_member_twibbon_media_id_media_id_fk" FOREIGN KEY ("twibbon_media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
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
 ALTER TABLE "team" ADD CONSTRAINT "team_payment_proof_media_id_media_id_fk" FOREIGN KEY ("payment_proof_media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
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
 ALTER TABLE "team_document" ADD CONSTRAINT "team_document_team_id_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "team_document" ADD CONSTRAINT "team_document_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "team_member_document" ADD CONSTRAINT "team_member_document_team_member_id_team_member_id_fk" FOREIGN KEY ("team_member_id") REFERENCES "public"."team_member"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "team_member_document" ADD CONSTRAINT "team_member_document_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_document" ADD CONSTRAINT "user_document_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_document" ADD CONSTRAINT "user_document_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
