import { type InferSelectModel, relations, sql } from "drizzle-orm";
import {
  type AnyPgColumn,
  boolean,
  date,
  index,
  integer,
  json,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { createId, getNow } from "../../utils/drizzle-schema-util";
import { userIdentity } from "./auth.schema";
import { event } from "./event.schema";
import { team } from "./team.schema";

export const user = pgTable("user", {
  id: text("id")
    .primaryKey()
    .references(() => userIdentity.id),
  email: text("email").notNull().unique(), // Add unique constraint
  fullName: text("full_name").notNull(),
  birthDate: date("birth_date"),
  instance: text("instance"),
  phoneNumber: text("phone_number"),
  requiredDocuments: text("required_documents"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(getNow),
});

export const userRelations = relations(user, ({ one, many }) => ({
  userIdentity: one(userIdentity, {
    fields: [user.id],
    references: [userIdentity.id],
  }),
  events: many(event),
	teams: many(team),
}));

export type User = InferSelectModel<typeof user>;
