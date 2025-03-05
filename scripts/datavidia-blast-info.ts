import { and, eq } from 'drizzle-orm';
import fs from 'fs';
import nodemailer from 'nodemailer';
import SMTPPool from 'nodemailer/lib/smtp-pool';
import { env } from '~/configs/env.config';
import { db } from '~/db/drizzle';
import { team, teamMember, user } from '~/db/schema';
import { generateGenericEmailTemplate } from '~/lib/nodemailer';

interface EmailData {
  teamId: string;
  teamName: string;
  userName: string;
  email: string;
}

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

const sentEmailFilePath =
  'scripts/email-targets/datavidia-verified-teams-sent.csv';
const sentEmails: Set<string> = new Set(); // Use a Set to avoid duplicates

async function getDatavidiaData() {
  const data = await db
    .select()
    .from(team)
    .fullJoin(teamMember, eq(team.id, teamMember.teamId))
    .fullJoin(user, eq(user.id, teamMember.userId))
    .where(
      and(
        eq(team.competitionId, 's2l6dgmu'),
        eq(team.verificationStatus, 'VERIFIED'),
      ),
    )
    .orderBy(team.id);

  const csv = ['teamId;teamName;userName;userEmail'];
  data.forEach((d) => {
    csv.push(
      [d.team?.id, d.team?.name, d.user?.fullName, d.user?.email].join(';'),
    );
  });
  fs.writeFileSync(
    'scripts/email-targets/datavidia-verified-teams.csv',
    csv.join('\n'),
  );
}

async function main() {
  try {
    // await getDatavidiaData();
    // throw Error()

    // Read and parse email targets
    const emailFile = fs.readFileSync(
      'scripts/email-targets/datavidia-verified-teams.csv',
      'utf8',
    );
    const emailLines = emailFile.split('\n');
    emailLines.shift(); // Remove CSV header
    const data: EmailData[] = emailLines.map((line) => {
      const [teamId, teamName, userName, email] = line
        .replace('\r', '')
        .split(';');
      return { email, teamName, teamId, userName };
    });

    // Read previously sent emails
    if (fs.existsSync(sentEmailFilePath)) {
      const sentEmailFile = fs.readFileSync(sentEmailFilePath, 'utf8');
      const sentEmailParsed = sentEmailFile.split('\n');
      const sentEmailParsedData = sentEmailParsed.map((line) => {
        const [email] = line.replace('\r', '').split(';');
        return email;
      });
      sentEmailParsedData.forEach((emailData) => sentEmails.add(emailData));
    }

    // Filter out emails that have already been sent
    const unsentEmails = data.filter(
      (emailData) => !sentEmails.has(emailData.email),
    );
    if (unsentEmails.length === 0) {
      console.log('✅ All emails have already been sent. Exiting.');
      return;
    }

    await Promise.all(
      unsentEmails.map(async (val) => {
        try {
          let sentEmail: SMTPPool.SentMessageInfo;
          const emailTemplatePath = 'scripts/email/datavidia-tm.template.html';
          sentEmail = await transporter.sendMail({
            from: MAIL_FROM,
            to: val.email,
            subject: '[Datavidia 9.0] Materi TM & Informasi Babak Penyisihan',
            html: await generateGenericEmailTemplate({}, emailTemplatePath),
          });
          console.log(
            `[${new Date().toLocaleTimeString('id-ID')}]  Email sent to <${val.email}>`,
          );
          sentEmails.add(val.email); // Mark email as sent
        } catch (error) {
          console.error(`❌ Failed to send email  to ${val.email}:`, error);
        }
      }),
    );

    // Write updated sent emails list to csv
    const sentEmailsCSV = Array.from(sentEmails)
      .map((val) => `${val}`)
      .join('\n');
    fs.writeFileSync(sentEmailFilePath, sentEmailsCSV);

    console.log('✅ All emails processed successfully.');
  } catch (e) {
    console.error('❌ Error processing emails:', e);
    const sentEmailsCSV = Array.from(sentEmails)
      .map((val) => `${val}`)
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
