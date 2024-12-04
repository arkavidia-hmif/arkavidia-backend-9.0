ALTER TABLE "team" RENAME COLUMN "payment_proof_id" TO "payment_proof_media_id";--> statement-breakpoint
ALTER TABLE "team" DROP CONSTRAINT "team_payment_proof_id_media_id_fk";
--> statement-breakpoint
ALTER TABLE "team" DROP CONSTRAINT "team_competition_id_competition_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "team" ADD CONSTRAINT "team_payment_proof_media_id_media_id_fk" FOREIGN KEY ("payment_proof_media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "team" ADD CONSTRAINT "team_competition_id_competition_id_fk" FOREIGN KEY ("competition_id") REFERENCES "public"."competition"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
