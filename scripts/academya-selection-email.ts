import { sendAcademyaFailEmail, sendAcademyaPassEmail } from '~/lib/nodemailer';

async function getLolosEmails() {
  return [
    '18222134@std.stei.itb.ac.id',
    'ardrasahasika@gmail.com',
    'fawwazabrial.fas@gmail.com',
  ];
}

async function getGagalEmails() {
  return [
    '18222134@std.stei.itb.ac.id',
    'ardrasahasika@gmail.com',
    'fawwazabrial.fas@gmail.com',
  ];
}

async function main() {
  const lolosEmails = await getLolosEmails();
  const gagalEmails = await getGagalEmails();

  await Promise.all(
    lolosEmails.map(async (t, i) => {
      console.log(`Sent lolos emails: ${i + 1}/${lolosEmails.length}`);
      await sendAcademyaPassEmail(
        t,
        'Academya Software Engineering',
        'https://s.hmif.dev/SeleksiSEJadwalWawancara',
      );
    }),
  );

  await Promise.all(
    lolosEmails.map(async (t, i) => {
      console.log(`Sent gagal emails: ${i + 1}/${gagalEmails.length}`);
      await sendAcademyaFailEmail(t);
    }),
  );
}

if (require.main === module) {
  await main();
}
