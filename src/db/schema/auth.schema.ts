import {
  type InferInsertModel,
  type InferSelectModel,
  relations,
} from 'drizzle-orm';
import { boolean, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { createId, getNow } from '../../utils/drizzle-schema-util';
import { user } from './user.schema';

export const userIdentityProviderEnum = pgEnum('user_identity_provider_enum', [
  'google',
  'basic',
]);

export const userIdentityRoleEnum = pgEnum('user_identity_role_enum', [
  'admin',
  'user',
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

  role: userIdentityRoleEnum('role').default('user').notNull(),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').$onUpdate(getNow),
});

export const userIdentityRelations = relations(userIdentity, ({ one }) => ({
  user: one(user),
}));

export type UserIdentity = InferSelectModel<typeof userIdentity>;
export type UserIdentityInsert = InferInsertModel<typeof userIdentity>;
export type UserIdentityRolesEnum =
  (typeof userIdentityRoleEnum.enumValues)[number];
