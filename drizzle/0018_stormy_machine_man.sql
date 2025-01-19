CREATE TYPE "public"."team_document_type_enum" AS ENUM('bukti-pembayaran');--> statement-breakpoint
CREATE TYPE "public"."team_member_document_type_enum" AS ENUM('poster', 'twibbon');--> statement-breakpoint
CREATE TYPE "public"."user_document_type_enum" AS ENUM('nisn', 'kartu-identitas');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "team_document" (
	"team_id" text NOT NULL,
	"type" "team_document_type_enum" NOT NULL,
	"media_id" text NOT NULL,
	CONSTRAINT "team_document_team_id_type_pk" PRIMARY KEY("team_id","type")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "team_member_document" (
	"team_member_id" text NOT NULL,
	"type" "team_member_document_type_enum" NOT NULL,
	"media_id" text NOT NULL,
	CONSTRAINT "team_member_document_team_member_id_type_pk" PRIMARY KEY("team_member_id","type")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_document" (
	"user_id" text NOT NULL,
	"type" "user_document_type_enum" NOT NULL,
	"media_id" text NOT NULL,
	CONSTRAINT "user_document_user_id_type_pk" PRIMARY KEY("user_id","type")
);
--> statement-breakpoint
ALTER TABLE "team_member" DROP CONSTRAINT "team_member_user_id_team_id_pk";--> statement-breakpoint
ALTER TABLE "team_member" ADD COLUMN "id" text PRIMARY KEY NOT NULL;--> statement-breakpoint
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
--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN IF EXISTS "media_identity_card_id";