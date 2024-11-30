CREATE TYPE "public"."user_identity_provider_enum" AS ENUM('google', 'basic');--> statement-breakpoint
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
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp,
	CONSTRAINT "user_identity_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"birth_date" date,
	"instance" text,
	"phone_number" text,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user" ADD CONSTRAINT "user_id_user_identity_id_fk" FOREIGN KEY ("id") REFERENCES "public"."user_identity"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
