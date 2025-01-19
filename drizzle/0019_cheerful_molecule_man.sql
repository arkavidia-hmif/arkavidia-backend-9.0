ALTER TABLE "team_document" ADD COLUMN "is_verified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "team_document" ADD COLUMN "verification_error" text;--> statement-breakpoint
ALTER TABLE "team_member_document" ADD COLUMN "is_verified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "team_member_document" ADD COLUMN "verification_error" text;--> statement-breakpoint
ALTER TABLE "user_document" ADD COLUMN "is_verified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user_document" ADD COLUMN "verification_error" text;