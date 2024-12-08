import { Database } from '../db/drizzle';
import { competition, team } from '../db/schema';
import { count,eq } from 'drizzle-orm';

export const getCompetitionParticipantNumber = async(
  db:Database,
  competitionId:string
)=>{
  const [result] = await db.select({
    participantCount:count()
  }).from(team)
  .where(eq(team.competitionId,competitionId));

  return result;
}

export const getCompetitionById = async(
  db:Database,
  competitionId:string
)=>{
  const [result] = await db.select().from(competition)
    .where(eq(competition.id,competitionId))
  return result;
}
