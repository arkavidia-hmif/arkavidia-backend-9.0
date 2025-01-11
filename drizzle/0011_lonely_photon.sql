ALTER TABLE "competition_timeline" RENAME COLUMN "date" TO "start_date";--> statement-breakpoint
ALTER TABLE "competition_timeline" ADD COLUMN "end_date" timestamp;