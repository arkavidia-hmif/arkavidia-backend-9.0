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
import { user } from "./user.schema";

export const event = pgTable("event", {
  id: text("id").primaryKey().$defaultFn(createId),
  title: text("title").notNull(),
  description: text("description"),
  dateStart: date("date_start").notNull(),
  dateEnd: date("date_end").notNull(),
  location: text("location"),
  registrationFee: integer("registration_fee"), // Fixed typo
  maxParticipants: integer("max_participants"),
  guideBook: text("guide_book"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(getNow),
});

export const eventRelations = relations(event, ({ many }) => ({
  users: many(user),
}));
