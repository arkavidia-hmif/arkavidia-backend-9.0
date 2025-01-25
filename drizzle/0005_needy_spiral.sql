ALTER TABLE "competition_submission_requirement" ADD COLUMN "order" integer DEFAULT -1 NOT NULL;--> statement-breakpoint
-- ALTER TABLE "public"."user_identity" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
-- DROP TYPE "public"."user_identity_role_enum";--> statement-breakpoint
-- CREATE TYPE "public"."user_identity_role_enum" AS ENUM(
ALTER TABLE "public"."user_identity" ALTER COLUMN "role" SET DATA TYPE "public"."user_identity_role_enum" USING "role"::"public"."user_identity_role_enum";--> statement-breakpoint
ALTER TYPE user_identity_role_enum ADD VALUE 'superadmin';--> statement-breakpoint
ALTER TYPE user_identity_role_enum ADD VALUE 'admin_competition';--> statement-breakpoint
ALTER TYPE user_identity_role_enum ADD VALUE 'admin_competition_cp';--> statement-breakpoint
ALTER TYPE user_identity_role_enum ADD VALUE 'admin_competition_ctf';--> statement-breakpoint
ALTER TYPE user_identity_role_enum ADD VALUE 'admin_competition_arkalogica';--> statement-breakpoint
ALTER TYPE user_identity_role_enum ADD VALUE 'admin_competition_datavidia';--> statement-breakpoint
ALTER TYPE user_identity_role_enum ADD VALUE 'admin_competition_hackvidia';--> statement-breakpoint
ALTER TYPE user_identity_role_enum ADD VALUE 'admin_competition_uxvidia';--> statement-breakpoint
ALTER TYPE user_identity_role_enum ADD VALUE 'admin_event';--> statement-breakpoint
ALTER TYPE user_identity_role_enum ADD VALUE 'admin_event_academya_softeng';--> statement-breakpoint
ALTER TYPE user_identity_role_enum ADD VALUE 'admin_event_academya_datsci';--> statement-breakpoint
ALTER TYPE user_identity_role_enum ADD VALUE 'admin_event_academya_uiux';--> statement-breakpoint
ALTER TYPE user_identity_role_enum ADD VALUE 'admin_event_academya_pm';--> statement-breakpoint
ALTER TYPE user_identity_role_enum DROP VALUE 'admin';--> statement-breakpoint