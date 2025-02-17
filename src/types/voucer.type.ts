import { createSelectSchema } from 'drizzle-zod';
import { voucer } from '~/db/schema/voucer.schema';

import { BarebonesTeamSchema } from './team.type';

export const VoucerSchema = createSelectSchema(voucer).extend({
  team: BarebonesTeamSchema,
});
