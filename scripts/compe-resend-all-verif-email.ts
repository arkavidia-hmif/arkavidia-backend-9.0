import { and, eq } from 'drizzle-orm';
import fs, { link } from 'fs';
import nodemailer from 'nodemailer';
import SMTPPool from 'nodemailer/lib/smtp-pool';
import { env } from '~/configs/env.config';
import { db } from '~/db/drizzle';
import { team, teamMember, user } from '~/db/schema';
import { generateGenericEmailTemplate } from '~/lib/nodemailer';
import { getCompetitionGroupChat } from '~/utils/competition-utils';

interface EmailData {
  title: string;
  team_name: string;
  full_name: string;
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
  'scripts/email-targets/compe-verified-emails-sent.csv';
const sentEmails: Set<string> = new Set(); // Use a Set to avoid duplicates

async function main() {
  try {
    // Read and parse email targets
    const emailFile = fs.readFileSync(
      'scripts/email-targets/compe-verified-emails.csv',
      'utf8',
    );
    const emailLines = emailFile.split('\n');
    emailLines.shift(); // Remove CSV header
    const data: EmailData[] = emailLines.map((line) => {
      const [title, team_name, full_name, email] = line
        .replace('\r', '')
        .split(';');
      return { title, team_name, full_name, email };
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
          const emailTemplatePath =
            'scripts/email/compe-reminder-join-group.template.html';
          sentEmail = await transporter.sendMail({
            from: MAIL_FROM,
            to: val.email,
            subject: `[Arkavidia ${val.title} 9.0] Remember to join your group!`,
            html: await generateGenericEmailTemplate(
              {
                full_name: val.full_name.replace('"', '').trim(),
                link: getCompetitionGroupChat(val.title),
              },
              emailTemplatePath,
            ),
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
