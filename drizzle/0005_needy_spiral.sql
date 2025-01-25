ALTER TABLE "competition_submission_requirement" ADD COLUMN "order" integer DEFAULT -1 NOT NULL;--> statement-breakpoint
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
ALTER TYPE user_identity_role_enum ADD VALUE 'admin_event_academya_pm';