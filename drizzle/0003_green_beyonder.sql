CREATE TYPE "public"."user_identity_role_enum" AS ENUM('admin', 'user');--> statement-breakpoint
ALTER TABLE "user_identity" ADD COLUMN "role" "user_identity_role_enum" DEFAULT 'user' NOT NULL;