CREATE TYPE "public"."competition_team_final_status_enum" AS ENUM('On Review', 'Not Pass', 'Juara 1', 'Juara 2', 'Juara 3');--> statement-breakpoint
CREATE TYPE "public"."competition_team_preeliminary_status_enum" AS ENUM('On Review', 'Pass', 'Not Pass');--> statement-breakpoint
ALTER TABLE "team" ADD COLUMN "preeliminary_status" "competition_team_preeliminary_status_enum" DEFAULT 'On Review' NOT NULL;--> statement-breakpoint
ALTER TABLE "team" ADD COLUMN "final_status" "competition_team_final_status_enum" DEFAULT 'On Review' NOT NULL;