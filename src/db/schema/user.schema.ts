import { type InferSelectModel, relations } from "drizzle-orm";
import {
  date,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { getNow } from "../../utils/drizzle-schema-util";
import { userIdentity } from "./auth.schema";
import { userDocument } from "./user-document.schema";
import { teamMember } from "./team-member.schema";
import { eventParticipant } from "./event-participant.schema";

export const user = pgTable("user", {
  id: text("id")
    .primaryKey()
    .references(() => userIdentity.id),
  email: text("email").notNull().unique(), // Add unique constraint
  fullName: text("full_name"),
  birthDate: date("birth_date"),
  instance: text("instance"),
  phoneNumber: text("phone_number"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(getNow),
});

export const userRelations = relations(user, ({ one, many }) => ({
	userIdentity: one(userIdentity, {
		fields: [user.id],
		references: [userIdentity.id],
	}),
	userDocument: many(userDocument),
	eventParticipant: many(eventParticipant),
	teamMember: many(teamMember),
}));

export type User = InferSelectModel<typeof user>;
