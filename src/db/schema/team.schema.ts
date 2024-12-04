import { relations } from 'drizzle-orm';
import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { createId, getNow } from '../../utils/drizzle-schema-util';
import { competition } from './competition.schema';
import { teamMember } from './team-member.schema';
import { media } from './media.schema';

export const team = pgTable('team', {
	id: text('id').primaryKey().$defaultFn(createId),
	competitionId: text('competition_id').notNull().references(() => competition.id), // Add reference to competition
	name: text('team_name').notNull(),
	joinCode: text('team_code').notNull().$defaultFn(createId).unique(), // Add unique constraint
	paymentProofMediaId: text('payment_proof_media_id').references(() => media.id), // Picture of payment proof

	isVerified: boolean('is_verified').default(false).notNull(),
	verificationError: text('verification_error'),

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
		fields: [team.paymentProofMediaId],
		references: [media.id],
	}),
}));
