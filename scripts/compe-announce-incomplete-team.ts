import { eq, or } from 'drizzle-orm';
import fs from 'fs';
import nodemailer from 'nodemailer';
import SMTPPool from 'nodemailer/lib/smtp-pool';
import { env } from '~/configs/env.config';
import { db } from '~/db/drizzle';
import { team } from '~/db/schema';
import { generateGenericEmailTemplate } from '~/lib/nodemailer';

const MAIL_FROM = `Arkavidia <${env.SMTP_USER}>`;

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE,
  pool: true,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASSWORD,
  },
});

interface EmailData {
  email: string;
  teamName: string;
  compe: string;
}

const sentEmailFilePath = 'scripts/email-targets/incomplete-teams-sent.csv';
const sentEmails: Set<EmailData> = new Set(); // Use a Set to avoid duplicates

const findAllIncompleteTeams = async () => {
  const incompleteTeams = await db.query.team.findMany({
    where: or(
      eq(team.verificationStatus, 'DENIED'),
      eq(team.verificationStatus, 'INCOMPLETE'),
    ),
    columns: {
      name: true,
    },
    with: {
      competition: {
        columns: {
          title: true,
        },
      },
      teamMembers: {
        with: {
          user: {
            columns: {
              email: true,
            },
          },
        },
      },
    },
  });

  console.log(incompleteTeams.length);

  // write to csv
  const csv = ['teamName;compe;email'];
  incompleteTeams.forEach((team) => {
    team.teamMembers.forEach((teamMember) => {
      csv.push(
        `${team.name};${team.competition.title};${teamMember.user.email}`,
      );
    });
  });
  fs.writeFileSync(
    'scripts/email-targets/incomplete-teams.csv',
    csv.join('\n'),
  );
};

async function main() {
  try {
    // await findAllIncompleteTeams();
    // Read and parse email targets
    const emailFile = fs.readFileSync(
      'scripts/email-targets/incomplete-teams.csv',
      'utf8',
    );
    const emailLines = emailFile.split('\n');
    emailLines.shift(); // Remove CSV header
    const data: EmailData[] = emailLines.map((line) => {
      const [teamName, compe, email] = line.replace('\r', '').split(';');
      return { email, teamName, compe };
    });

    // Read previously sent emails
    if (fs.existsSync(sentEmailFilePath)) {
      const sentEmailFile = fs.readFileSync(sentEmailFilePath, 'utf8');
      const sentEmailParsed = sentEmailFile.split('\n');
      const sentEmailParsedData = sentEmailParsed.map((line) => {
        const [teamName, compe, email] = line.replace('\r', '').split(';');
        return { email, teamName, compe };
      });
      sentEmailParsedData.forEach((emailData) => sentEmails.add(emailData));
    }

    // Filter out emails that have already been sent
    const unsentEmails = data.filter((emailData) => {
      for (const sentEmail of sentEmails) {
        if (
          sentEmail.email === emailData.email &&
          sentEmail.compe === emailData.compe &&
          sentEmail.teamName === emailData.teamName
        ) {
          return false;
        }
      }
      return true;
    });
    if (unsentEmails.length === 0) {
      console.log('✅ All emails have already been sent. Exiting.');
      return;
    }

    await Promise.all(
      unsentEmails.map(async (val) => {
        try {
          let sentEmail: SMTPPool.SentMessageInfo;
          const emailTemplatePath = 'src/lib/compe-reminder.template.html';
          sentEmail = await transporter.sendMail({
            from: MAIL_FROM,
            to: val.email,
            subject: 'Reminder: Lengkapi Data Tim Arkavidia 9.0',
            html: await generateGenericEmailTemplate(
              {
                title: 'Lengkapi Data Tim Arkavidia 9.0',
                teamName: val.teamName,
                link: `${env.FE_URL}/dashboard/${val.compe}`,
                fe_url: env.FE_URL,
              },
              emailTemplatePath,
            ),
          });
          console.log(
            `[${new Date().toLocaleTimeString('id-ID')}] (${val.compe}, ${val.teamName}) Email sent to <${val.email}>`,
          );
          sentEmails.add(val); // Mark email as sent
        } catch (error) {
          console.error(
            `❌ Failed to send email (${val.compe}, ${val.teamName}) to ${val.email}:`,
            error,
          );
        }
      }),
    );

    // Write updated sent emails list to csv
    const sentEmailsCSV = Array.from(sentEmails)
      .map((val) => `${val.teamName};${val.compe};${val.email}`)
      .join('\n');
    fs.writeFileSync(sentEmailFilePath, sentEmailsCSV);

    console.log('✅ All emails processed successfully.');
  } catch (e) {
    console.error('❌ Error processing emails:', e);
    const sentEmailsCSV = Array.from(sentEmails)
      .map((val) => `${val.teamName};${val.compe};${val.email}`)
      .join('\n');
    fs.writeFileSync(sentEmailFilePath, sentEmailsCSV);
  } finally {
    transporter.close(); // Ensure transporter is closed
    process.exit(0);
  }
}

if (require.main === module) {
  main()
    .then(() => {
      console.log('🚀 Script execution completed.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Unhandled error:', err);
      process.exit(0);
    });
}
