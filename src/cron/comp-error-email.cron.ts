import { CronJob } from 'cron';
import { eq } from 'drizzle-orm';
import { db } from '~/db/drizzle';
import { team } from '~/db/schema';
import { sendVerificationDenyEmail } from '~/lib/nodemailer';

export interface CompVerifErrorInterface {
  buktiPembayaran: string | null;
  teamMember: {
    userId: string;
    userName: string;
    twibbon: string | null;
    poster: string | null;
    kartuIdentitas: string | null;
  }[];
}

export const turnErrorToList = (errors: CompVerifErrorInterface) => {
  const errorList = [];
  if (errors.buktiPembayaran) {
    errorList.push({
      title: 'Bukti Pembayaran',
      error: errors.buktiPembayaran,
    });
  }
  errors.teamMember.forEach((tm) => {
    if (tm.twibbon) {
      errorList.push({
        title: `Twibbon - ${tm.userName}`,
        error: tm.twibbon,
      });
    }
    if (tm.poster) {
      errorList.push({
        title: `Poster - ${tm.userName}`,
        error: tm.poster,
      });
    }
    if (tm.kartuIdentitas) {
      errorList.push({
        title: `Kartu Identitas - ${tm.userName}`,
        error: tm.kartuIdentitas,
      });
    }
  });

  return errorList;
};

const sendErrorEmail = async () => {
  const deniedTeams = await db.query.team.findMany({
    where: eq(team.verificationStatus, 'DENIED'),
    with: {
      document: true,
      competition: true,
      teamMembers: {
        with: { document: true, user: { with: { document: true } } },
      },
    },
  });

  await Promise.all(
    deniedTeams.map(async (d) => {
      const errors: CompVerifErrorInterface = {
        buktiPembayaran: d.document[0].verificationError,
        teamMember: d.teamMembers.map((t) => {
          return {
            userId: t.userId,
            userName: t.user.fullName as string,
            twibbon: t.document[0].verificationError,
            poster: t.document[1].verificationError,
            kartuIdentitas: t.user.document[0].verificationError,
          };
        }),
      };

      //   console.log(errors);
      //   console.log(turnErrorToList(errors));

      await Promise.all(
        d.teamMembers.map(async (tm) => {
          await sendVerificationDenyEmail(
            tm.user.email,
            d.name,
            d.competition.title,
            errors,
          );
        }),
      );
    }),
  );
};

export const competitionErrorEmailCron = new CronJob(
  '* * * * *',
  sendErrorEmail,
  null,
  true,
  'Asia/Jakarta',
);
