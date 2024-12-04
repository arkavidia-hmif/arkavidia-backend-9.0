CREATE TYPE "public"."user_identity_provider_enum" AS ENUM('google', 'basic');--> statement-breakpoint
CREATE TYPE "public"."media_bucket_enum" AS ENUM('competition-registration');--> statement-breakpoint
CREATE TYPE "public"."team_member_role_renum" AS ENUM('leader', 'member');--> statement-breakpoint
CREATE TYPE "public"."user_education_enum" AS ENUM('s1', 's2', 'sma');--> statement-breakpoint
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
	"payment_proof_id" text,
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
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
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
 ALTER TABLE "team" ADD CONSTRAINT "team_competition_id_competition_id_fk" FOREIGN KEY ("competition_id") REFERENCES "public"."competition"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "team" ADD CONSTRAINT "team_payment_proof_id_media_id_fk" FOREIGN KEY ("payment_proof_id") REFERENCES "public"."media"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user" ADD CONSTRAINT "user_id_user_identity_id_fk" FOREIGN KEY ("id") REFERENCES "public"."user_identity"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
