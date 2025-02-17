import { relations } from 'drizzle-orm';
import { pgTable, text } from 'drizzle-orm/pg-core';
import { createId } from '~/utils/drizzle-schema-util';

import { team } from './team.schema';

export const voucer = pgTable('voucer', {
  id: text('id').primaryKey().$defaultFn(createId),
  code: text('code').notNull(),
  requiredTeamCount: text('required_team_count').notNull(),
});

export const voucerRelations = relations(voucer, ({ many }) => ({
  team: many(team),
}));
