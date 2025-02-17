ALTER TABLE "team_document" DROP CONSTRAINT "team_document_team_id_team_id_fk";
--> statement-breakpoint
ALTER TABLE "team_document" DROP CONSTRAINT "team_document_media_id_media_id_fk";
--> statement-breakpoint
ALTER TABLE "team_member_document" DROP CONSTRAINT "team_member_document_media_id_media_id_fk";
--> statement-breakpoint
ALTER TABLE "user_document" DROP CONSTRAINT "user_document_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "user_document" DROP CONSTRAINT "user_document_media_id_media_id_fk";
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

