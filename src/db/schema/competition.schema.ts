import { type InferSelectModel, relations, sql } from "drizzle-orm";
import {
  date,
  integer,
  pgTable,
  text,
} from "drizzle-orm/pg-core";
import { createId, getNow } from "../../utils/drizzle-schema-util";
import { team } from "./team.schema";

export const competition = pgTable("competition", {
  id: text("id").primaryKey().$defaultFn(createId),
  title: text("title").notNull(),
  description: text("description"),
  dateStart: date("date_start").notNull(),
  dateEnd: date("date_end").notNull(),
  location: text("location"),
  registerationFee: integer("registeration_fee"),
  maxParticipants: integer("max_participants"),
  guidebookUrl: text("guide_book_url"),
});

export const competitionRelations = relations(competition, ({ many }) => ({
	team: many(team),
}));
