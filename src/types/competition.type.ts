import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { competition } from '~/db/schema';

export const CompetitionSchema = createSelectSchema(competition).openapi('Competition');