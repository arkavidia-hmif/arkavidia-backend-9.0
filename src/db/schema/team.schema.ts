import { relations } from 'drizzle-orm';
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { createId, getNow } from '../../utils/drizzle-schema-util';
import { competition } from './competition.schema';
import { teamMember } from './team-member.schema';
import { media } from './media.schema';

export const team = pgTable('team', {
	id: text('id').primaryKey().$defaultFn(createId),
	competitionId: text('competition_id').references(() => competition.id), // Add reference to competition
	teamName: text('team_name').notNull(),
	teamCode: text('team_code').notNull().$defaultFn(createId).unique(), // Add unique constraint
	paymentProofId: text('payment_proof_id').references(() => media.id), // Picture of payment proof
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').$onUpdate(getNow),
});

export const teamRelations = relations(team, ({ one, many }) => ({
	teamMembers: many(teamMember),
	competition: one(competition, {
		fields: [team.competitionId],
		references: [competition.id],
	}),
	paymentProof: one(media, {
		fields: [team.paymentProofId],
		references: [media.id],
	}),
}));
