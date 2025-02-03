import { db } from '~/db/drizzle';
import {
  inferVerificationStatus,
  updateTeam,
} from '~/repositories/team.repository';

async function main() {
  const teams = await db.query.team.findMany();

  await Promise.all(
    teams.map(async (t, i) => {
      console.log(`${i + 1}/${teams.length}`);

      const verificationStatus = await inferVerificationStatus(db, t.id);
      await updateTeam(db, t.id, { verificationStatus });
    }),
  );
}

if (require.main === module) {
  await main();
}
