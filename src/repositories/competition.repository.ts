import { Database } from "../db/drizzle";
import { competition, team } from "../db/schema";
import { eq } from "drizzle-orm";

export const getCompetitionParticipantNumber = async (
  db: Database,
  competitionId: string,
) => {
  const result = await db.query.team.findMany({
    where: eq(team.competitionId, competitionId),
  });
  return { participantCount: result.length };
};

export const getCompetitionById = async (
  db: Database,
  competitionId: string,
) => {
  const result = await db.query.competition.findFirst({
    where: eq(competition.id, competitionId),
  });

  return { maxParticipants: result?.maxParticipants };
};
