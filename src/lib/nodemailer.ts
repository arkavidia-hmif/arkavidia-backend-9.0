import nodemailer from 'nodemailer';
import { env } from '~/configs/env.config';

const MAIL_FROM = `Arkavidia <${env.SMTP_USER}>`;

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASSWORD,
  },
});

export const sendVerificationEmail = async (
  targetEmail: string,
  verificationToken: string,
  userId: string,
) => {
  const info = await transporter.sendMail({
    from: MAIL_FROM,
    to: targetEmail,
    subject: 'Verify your account!',
    text: `http://api.arkavidia.com/api/verify?user=${userId}&token=${verificationToken}`, // TODO: Change this to beautiful HTML
  });

  console.log('Message sent: %s', info.messageId);
};
