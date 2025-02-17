import { InferSelectModel, relations } from 'drizzle-orm';
import { integer, pgTable, text } from 'drizzle-orm/pg-core';
import { createId } from '~/utils/drizzle-schema-util';

import { Team, team } from './team.schema';

export const voucer = pgTable('voucer', {
  id: text('id').primaryKey().$defaultFn(createId),
  code: text('code').notNull(),
  requiredTeamCount: integer('required_team_count').notNull(),
  discount: integer('discount'),
});

export const voucerRelations = relations(voucer, ({ many }) => ({
  team: many(team),
}));

export type Voucer = InferSelectModel<typeof voucer> & {
  team: Team[];
};
