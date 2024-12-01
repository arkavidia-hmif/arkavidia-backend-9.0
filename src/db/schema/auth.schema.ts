import {
	type InferInsertModel,
	type InferSelectModel,
	relations,
	sql,
} from 'drizzle-orm';
import {
	type AnyPgColumn,
	boolean,
	index,
	integer,
	json,
	pgEnum,
	pgTable,
	primaryKey,
	text,
	timestamp,
	unique,
} from 'drizzle-orm/pg-core';
import { createId, getNow } from '../../utils/drizzle-schema-util';
import { user } from './user.schema';

export const userIdentityProviderEnum = pgEnum('user_identity_provider_enum', [
	'google',
	'basic',
]);

export const userIdentity = pgTable('user_identity', {
	id: text('id').primaryKey().$defaultFn(createId),
	email: text('email').unique().notNull(),
	provider: userIdentityProviderEnum('provider').notNull(),
	hash: text('hash').notNull(),

	isVerified: boolean('is_verified').default(false).notNull(),
	verificationToken: text('verification_token').notNull(),
	verificationTokenExpiration: timestamp(
		'verification_token_expiration',
	).notNull(),

	passwordRecoveryToken: text('password_recovery_token'),
	passwordRecoveryTokenExpiration: timestamp(
		'password_recovery_token_expiration',
	),

	refreshToken: text('refresh_token'),

	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').$onUpdate(getNow),
});

export const userIdentityRelations = relations(userIdentity, ({ one }) => ({
	user: one(user),
}));

export type UserIdentity = InferSelectModel<typeof userIdentity>;
export type UserIdentityInsert = InferInsertModel<typeof userIdentity>;
