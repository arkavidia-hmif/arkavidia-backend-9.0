import fs from 'fs';
import handlebars from 'handlebars';
import nodemailer from 'nodemailer';
import { env } from '~/configs/env.config';
import { expandCompetitionTitle } from '~/utils/competition-title';

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

export const generateEmailTemplate = async (
  data: {
    title: string;
    message: string;
    link?: string;
  },
  sourcePath: string = 'src/lib/email.html',
) => {
  const source = fs.readFileSync(sourcePath, 'utf8');
  const template = handlebars.compile(source);
  return template({ ...data, fe_url: env.FE_URL });
};

export const sendVerificationEmail = async (
  targetEmail: string,
  verificationToken: string,
  userId: string,
) => {
  const info = await transporter.sendMail({
    from: MAIL_FROM,
    to: targetEmail,
    subject: 'Arkavidia - Verify your account!',
    html: await generateEmailTemplate({
      title: 'Verify Your Account',
      message: 'Tekan tombol dibawah ini untuk melakukan verifikasi akun.',
      link: `${env.FE_URL}/auth/verify?user=${encodeURIComponent(userId)}&token=${encodeURIComponent(verificationToken)}`,
    }),
  });

  console.log('Message sent: %s', info.messageId);
};

export const sendResetPasswordEmail = async (
  targetEmail: string,
  resetPasswordToken: string,
  userId: string,
) => {
  const info = await transporter.sendMail({
    from: MAIL_FROM,
    to: targetEmail,
    subject: 'Arkavidia - Reset your password!',
    html: await generateEmailTemplate({
      title: 'Reset your password',
      message: 'Tekan tombol dibawah ini untuk melakukan reset password.',
      link: `${env.FE_URL}/reset-password?user=${encodeURIComponent(userId)}&token=${encodeURIComponent(resetPasswordToken)}`,
    }),
  });

  console.log('Message sent: %s', info.messageId);
};

// export const sendVerificationDenyEmail = async (targetEmail: string) => {};

export const sendVerificationAcceptEmail = async (
  targetEmail: string,
  teamName: string,
  competitionSlug: string,
) => {
  await transporter.sendMail({
    from: MAIL_FROM,
    to: targetEmail,
    subject: 'Arkavidia - Your team has been verified!',
    html: await generateEmailTemplate(
      {
        title: `Tim ${teamName} berhasil diverifikasi`,
        message: `Selamat! Tim ${teamName} untuk lomba ${expandCompetitionTitle(competitionSlug)} telah berhasil diverifikasi. Untuk kembali ke dashboard anda dapat menekan tombol di bawah ini.`,
        link: `${env.FE_URL}/dashboard/${competitionSlug}`,
      },
      'src/lib/generic-email.html',
    ),
  });
};
