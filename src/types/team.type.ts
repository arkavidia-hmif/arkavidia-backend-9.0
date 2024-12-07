import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { team } from '../db/schema';

export const TeamIdParam = z.object({ teamId: z.string() });

export const PostTeamBodySchema = createInsertSchema(team)
.pick({
  competitionId:true, 
  name:true
}); 

export const TeamSchema = createSelectSchema(team);
