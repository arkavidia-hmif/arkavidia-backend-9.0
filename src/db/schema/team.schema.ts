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
import { competition } from "./competition.schema";

export const team = pgTable("team", {
  id: text("id").primaryKey().$defaultFn(createId),
  teamLeaderId: text("team_leader_id").references(() => user.id),
  teamName: text("team_name").notNull(),
  joinLink: text("join_link"),
  teamCode: text("team_code").notNull().unique(), // Add unique constraint
  requiredDocuments: text("required_documents"),
  competitionId: text("competition_id").references(() => competition.id), // Add reference to competition
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(getNow),
});

export const teamRelations = relations(team, ({ one, many }) => ({
  teamLeader: one(user, {
    fields: [team.teamLeaderId],
    references: [user.id],
  }),
  teamMembers: many(user),
  competition: one(competition, {
    fields: [team.competitionId],
    references: [competition.id],
  }),
}));