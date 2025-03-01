import fs from 'fs';
import nodemailer from 'nodemailer';
import SMTPPool from 'nodemailer/lib/smtp-pool';
import { env } from '~/configs/env.config';
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
  event: string;
  accepted: boolean;
}

const sentEmailFilePath = 'scripts/email-targets/academya-seleksi-2-sent.csv';
const sentEmails: Set<string> = new Set(); // Use a Set to avoid duplicates

async function main() {
  try {
    // Read and parse email targets
    const emailFile = fs.readFileSync(
      'scripts/email-targets/academya-seleksi-2.csv',
      'utf8',
    );
    const emailLines = emailFile.split('\n');
    emailLines.shift(); // Remove CSV header

    const data: EmailData[] = emailLines.map((line) => {
      const [email, event, accepted] = line.replace('\r', '').split(',');
      return { email, event, accepted: accepted === 'TRUE' };
    });

    // Read previously sent emails
    if (fs.existsSync(sentEmailFilePath)) {
      const sentEmailFile = fs.readFileSync(sentEmailFilePath, 'utf8');
      sentEmailFile.split(', ').forEach((email) => sentEmails.add(email));
    }

    // Filter out emails that have already been sent
    const unsentEmails = data.filter(({ email }) => !sentEmails.has(email));

    if (unsentEmails.length === 0) {
      console.log('✅ All emails have already been sent. Exiting.');
      return;
    }

    await Promise.all(
      unsentEmails.map(async (val) => {
        try {
          let sentEmail: SMTPPool.SentMessageInfo;
          const templatePath = val.accepted
            ? 'src/lib/acads-lolos-email-2.template.html'
            : 'src/lib/acads-gagal-email.template.html';

          sentEmail = await transporter.sendMail({
            from: MAIL_FROM,
            to: val.email,
            subject: 'Pengumuman Seleksi 2 Academya',
            html: await generateGenericEmailTemplate({}, templatePath),
          });

          console.log(
            `[${new Date().toLocaleTimeString('id-ID')}] (${val.event}) Email sent to <${val.email}>`,
          );
          sentEmails.add(val.email); // Mark email as sent
        } catch (error) {
          console.error(`❌ Failed to send email to ${val.email}:`, error);
        }
      }),
    );

    // Write updated sent emails list to file
    fs.writeFileSync(sentEmailFilePath, Array.from(sentEmails).join(', '));

    console.log('✅ All emails processed successfully.');
  } catch (e) {
    console.error('❌ Error processing emails:', e);
    fs.writeFileSync(sentEmailFilePath, Array.from(sentEmails).join(', '));
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
