CREATE TYPE "public"."event_team_final_status_enum" AS ENUM('On Review', 'Not Pass', 'Juara 1', 'Juara 2', 'Juara 3');--> statement-breakpoint
CREATE TYPE "public"."event_team_preeliminary_status_enum" AS ENUM('On Review', 'Pass', 'Not Pass');--> statement-breakpoint
CREATE TYPE "public"."event_phase_enum" AS ENUM('pre-eliminary', 'final');--> statement-breakpoint
CREATE TYPE "public"."event_team_document_type_enum" AS ENUM('submisi-awal');--> statement-breakpoint
CREATE TYPE "public"."event_team_member_document_type_enum" AS ENUM('poster', 'twibbon');--> statement-breakpoint
ALTER TYPE "public"."media_bucket_enum" ADD VALUE 'twibbon-event';--> statement-breakpoint
ALTER TYPE "public"."media_bucket_enum" ADD VALUE 'poster-event';--> statement-breakpoint
ALTER TYPE "public"."media_bucket_enum" ADD VALUE 'submission-awal-event';--> statement-breakpoint
ALTER TYPE "public"."media_bucket_enum" ADD VALUE 'submission-academya-softeng';--> statement-breakpoint
ALTER TYPE "public"."media_bucket_enum" ADD VALUE 'submission-academya-datsci';--> statement-breakpoint
ALTER TYPE "public"."media_bucket_enum" ADD VALUE 'submission-academya-uiux';--> statement-breakpoint
ALTER TYPE "public"."media_bucket_enum" ADD VALUE 'submission-academya-pm';--> statement-breakpoint
COMMIT;--> statement-breakpoint
ALTER TYPE "public"."team_verification_status_enum" ADD VALUE 'INCOMPLETE' BEFORE 'VERIFIED';--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "event_team" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"team_name" text NOT NULL,
	"stage" "event_phase_enum" DEFAULT 'pre-eliminary' NOT NULL,
	"verification_status" "team_verification_status_enum",
	"preeliminary_status" "event_team_preeliminary_status_enum" DEFAULT 'On Review' NOT NULL,
	"final_status" "event_team_final_status_enum" DEFAULT 'On Review' NOT NULL,
	"team_code" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp,
	CONSTRAINT "event_team_team_code_unique" UNIQUE("team_code")
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
CREATE TABLE IF NOT EXISTS "event_team_document" (
	"team_id" text NOT NULL,
	"type" "event_team_document_type_enum" NOT NULL,
	"media_id" text NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"verification_error" text,
	CONSTRAINT "event_team_document_team_id_type_pk" PRIMARY KEY("team_id","type")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "event_team_member" (
	"user_id" text NOT NULL,
	"team_id" text NOT NULL,
	"role" "team_member_role_enum" NOT NULL,
	CONSTRAINT "event_team_member_user_id_team_id_pk" PRIMARY KEY("user_id","team_id")
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
ALTER TABLE "team" ALTER COLUMN "verification_status" SET DEFAULT 'INCOMPLETE';--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "event_team" ADD CONSTRAINT "event_team_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE no action;
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
 ALTER TABLE "event_timeline" ADD CONSTRAINT "event_timeline_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
