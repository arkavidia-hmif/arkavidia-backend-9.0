import { z } from "zod";
import { createSelectSchema, createInsertSchema } from "drizzle-zod";
import { team } from "~/db/schema/team.schema";

export const TeamIdParam = z.object({ teamId: z.string() });

export const TeamSchema = createSelectSchema(team).openapi("Team");

export const PostTeamDocumentBodySchema = createInsertSchema(team).pick({
  paymentProofMediaId: true,
});
