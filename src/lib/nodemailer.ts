import fs from 'fs';
import handlebars from 'handlebars';
import nodemailer from 'nodemailer';
import { env } from '~/configs/env.config';
import {
  CompVerifErrorInterface,
  turnErrorToList,
} from '~/cron/comp-error-email.cron';
import {
  expandCompetitionTitle,
  getCompetitionGroupChat,
} from '~/utils/competition-utils';

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
    errorList?: {
      title: string;
      error: string;
    }[];
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

export const sendVerificationDenyEmail = async (
  targetEmail: string,
  teamName: string,
  competitionSlug: string,
  errors: CompVerifErrorInterface,
) => {
  await transporter.sendMail({
    from: MAIL_FROM,
    to: targetEmail,
    subject: 'Arkavidia - Fix your team!',
    html: await generateEmailTemplate(
      {
        title: `Tim ${teamName} gagal diverifikasi`,
        message: `Tim ${teamName} gagal diverifikasi karena alasan berikut:`,
        errorList: turnErrorToList(errors),
      },
      'src/lib/generic-email.html',
    ),
  });

  console.log('Sent deny email');
};

export const sendVerificationAcceptEmail = async (
  targetEmail: string,
  teamName: string,
  competitionSlug: string,
) => {
  const message =
    `Selamat! Tim ${teamName} untuk lomba ${expandCompetitionTitle(competitionSlug)} telah berhasil diverifikasi.` +
      competitionSlug !=
    'UXvidia'
      ? `Silahkan bergabung ke grup komunitas di bawah ini untuk mendapatkan informasi lanjutan.`
      : '';
  const link = getCompetitionGroupChat(competitionSlug);

  await transporter.sendMail({
    from: MAIL_FROM,
    to: targetEmail,
    subject: 'Arkavidia - Your team has been verified!',
    html: await generateEmailTemplate(
      {
        title: `Tim ${teamName} berhasil diverifikasi`,
        message,
        link,
      },
      'src/lib/generic-email.html',
    ),
  });
};
