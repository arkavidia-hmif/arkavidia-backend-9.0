// import argon2 from 'argon2';
import { eq, inArray } from 'drizzle-orm';
import fs from 'fs';
import { exit } from 'process';
import { createId } from '~/utils/drizzle-schema-util';

import { db } from '../drizzle';
import { first } from '../helper';
import {
  competition,
  competitionSubmissionRequirement,
  competitionTimeline,
  media,
  team,
  teamMember,
  user,
  userEducationEnum,
  userIdentity,
} from '../schema';

const VERIFICATION_TOKEN_EXPIRATION_TIME = 360000; // TTL 1 hour

// eslint-disable-next-line
async function seedUsers() {
  try {
    // Ask if the user wants to delete the table
    const userInput = await new Promise<string>((resolve) => {
      process.stdin.resume();
      process.stdin.setEncoding('utf8');
      process.stdout.write('Do you want to delete the user table? (yes/no) ');
      process.stdin.on('data', (data) => {
        resolve(data.toString().trim());
      });
    });

    if (userInput.toLowerCase() === 'yes') {
      // Ask user for confirmation
      const confirmInput = await new Promise<string>((resolve) => {
        const onData = (data: string) => {
          resolve(data.toString().trim());
        };
        process.stdin.resume();
        process.stdin.setEncoding('utf8');
        process.stdout.write('\x1b[31mAre you sure? (yes/no) \x1b[0m');
        process.stdin.on('data', onData);
      });

      if (confirmInput.toLowerCase() === 'yes') {
        console.log('Deleting user table...');
        await db.delete(user);
        await db.delete(userIdentity);
        console.log('🗑️ User table deleted!');
      }
    }

    const file = fs.readFileSync('src/db/seed/Seed - User.csv', 'utf8');
    const lines = file.split('\n');
    lines.shift();

    const data = lines.map(async (line) => {
      const [
        email,
        full_name,
        birth_date,
        education,
        entry_source,
        instance,
        phone_number,
        id_line,
        id_discord,
        id_instagram,
        consent,
        is_registration_complete,
        provider,
        is_verified,
        role,
        password,
      ] = line.replace('\r', '').split(',');
      const id = createId();
      const birthDate = new Date(birth_date);
      const edu =
        userEducationEnum[education as keyof typeof userEducationEnum];
      const hash = await argon2.hash(password);
      const verifyTokenExpiration = new Date(
        new Date().getTime() + VERIFICATION_TOKEN_EXPIRATION_TIME,
      );
      const verifyToken = await argon2.hash(
        `${email}${new Date()}${verifyTokenExpiration.toISOString()}`,
      );

      const userIdentityData = {
        id,
        email,
        hash,
        provider: provider as 'google' | 'basic',
        isVerified: is_verified === 'TRUE',
        verificationToken: verifyToken,
        verificationTokenExpiration: verifyTokenExpiration,
        role: role as 'admin' | 'user',
      };

      const userData = {
        id,
        email,
        fullName: full_name,
        birthDate: birthDate.toISOString(),
        education: edu as 's1' | 's2' | 'sma',
        entrySource: entry_source,
        instance,
        phoneNumber: phone_number,
        idLine: id_line,
        idDiscord: id_discord,
        idInstagram: id_instagram,
        consent: consent === 'TRUE',
        isRegistrationComplete: is_registration_complete === 'TRUE',
      };

      const existingUserIdentity = await db
        .select()
        .from(userIdentity)
        .where(eq(userIdentity.email, email))
        .then(first);
      const existingUser = await db
        .select()
        .from(user)
        .where(eq(user.email, email))
        .then(first);

      if (existingUserIdentity || existingUser) {
        console.log(`User with email ${email} already exists`);
        return { accountRes: existingUserIdentity, userRes: existingUser };
      }

      const accountRes = await db
        .insert(userIdentity)
        .values(userIdentityData)
        .returning();
      const userRes = await db
        .update(user)
        .set(userData)
        .where(eq(user.email, email))
        .returning();

      return { accountRes, userRes };
    });

    // eslint-disable-next-line
    const res = await Promise.all(data);

    process.stdin.pause();
    process.stdin.removeAllListeners('data');

    // console.log(res);
    console.log('✅ Users seeding success!');
  } catch (err) {
    console.log(err);
    throw '❌ Error seeding users!';
  }
}

async function seedCompetitions() {
  try {
    // Ask if the user wants to delete the table
    const userInput = await new Promise<string>((resolve) => {
      process.stdin.resume();
      process.stdin.setEncoding('utf8');
      process.stdout.write(
        'Do you want to delete the competition table? (yes/no) ',
      );
      process.stdin.on('data', (data) => {
        resolve(data.toString().trim());
      });
    });

    if (userInput.toLowerCase() === 'yes') {
      // Ask user for confirmation
      const confirmInput = await new Promise<string>((resolve) => {
        const onData = (data: string) => {
          resolve(data.toString().trim());
        };
        process.stdin.resume();
        process.stdin.setEncoding('utf8');
        process.stdout.write('\x1b[31mAre you sure? (yes/no) \x1b[0m');
        process.stdin.on('data', onData);
      });

      if (confirmInput.toLowerCase() === 'yes') {
        console.log('Deleting competition table...');
        await db.delete(competition);
        console.log('🗑️ Competition table deleted!');
      }
    }

    const file = fs.readFileSync('src/db/seed/Seed - Competition.csv', 'utf8');
    const lines = file.split('\n');
    lines.shift();
    const competitions = lines.map(async (line) => {
      const [
        title,
        description,
        max_participants,
        max_team_member,
        guide_book_url,
      ] = line.replace('\r', '').split(';');

      const existingCompetition = await db
        .select()
        .from(competition)
        .where(eq(competition.title, title))
        .then(first);

      if (existingCompetition) {
        console.log(`Competition with title ${title} already exists`);
        return existingCompetition;
      }

      const res = await db
        .insert(competition)
        .values({
          title,
          description,
          maxParticipants: parseInt(max_participants),
          maxTeamMember: parseInt(max_team_member),
          guidebookUrl: guide_book_url,
        })
        .returning()
        .then(first);
      return res;
    });

    // eslint-disable-next-line
    const res = await Promise.all(competitions);

    process.stdin.pause();
    process.stdin.removeAllListeners('data');

    // console.log(res);
    console.log('✅ Competitions seeding success!');
  } catch (err) {
    console.log(err);
    throw '❌ Error seeding competitions!';
  }
}

// eslint-disable-next-line
async function seedMedias() {
  try {
    // Ask if the user wants to delete the table
    const userInput = await new Promise<string>((resolve) => {
      process.stdin.resume();
      process.stdin.setEncoding('utf8');
      process.stdout.write('Do you want to delete the media table? (yes/no) ');
      process.stdin.on('data', (data) => {
        resolve(data.toString().trim());
      });
    });

    if (userInput.toLowerCase() === 'yes') {
      // Ask user for confirmation
      const confirmInput = await new Promise<string>((resolve) => {
        const onData = (data: string) => {
          resolve(data.toString().trim());
        };
        process.stdin.resume();
        process.stdin.setEncoding('utf8');
        process.stdout.write('\x1b[31mAre you sure? (yes/no) \x1b[0m');
        process.stdin.on('data', onData);
      });

      if (confirmInput.toLowerCase() === 'yes') {
        console.log('Deleting media table...');
        await db.delete(media);
        console.log('🗑️ Media table deleted!');
      }
    }

    const file = fs.readFileSync('src/db/seed/Seed - Media.csv', 'utf8');
    const lines = file.split('\n');
    lines.shift();
    const medias = lines.map(async (line) => {
      const [name, bucket, type, url] = line.replace('\r', '').split(',');

      const creator = await db.select().from(user).then(first);
      const creatorId = creator?.id ?? '';

      const existingMedia = await db
        .select()
        .from(media)
        .where(eq(media.name, name))
        .then(first);

      if (existingMedia) {
        console.log(`Media with name ${name} already exists`);
        return existingMedia;
      }

      const res = await db
        .insert(media)
        .values({ name, creatorId, bucket, type, url })
        .returning()
        .then(first);

      return res;
    });

    // eslint-disable-next-line
    const res = await Promise.all(medias);

    process.stdin.pause();
    process.stdin.removeAllListeners('data');

    // console.log(res);
    console.log('✅ Medias seeding success!');
  } catch (err) {
    console.log(err);
    throw '❌ Error seeding medias!';
  }
}

// eslint-disable-next-line
async function seedTeams() {
  try {
    // Ask if the user wants to delete the table
    const userInput = await new Promise<string>((resolve) => {
      process.stdin.resume();
      process.stdin.setEncoding('utf8');
      process.stdout.write('Do you want to delete the team table? (yes/no) ');
      process.stdin.on('data', (data) => {
        resolve(data.toString().trim());
      });
    });

    if (userInput.toLowerCase() === 'yes') {
      // Ask user for confirmation
      const confirmInput = await new Promise<string>((resolve) => {
        const onData = (data: string) => {
          resolve(data.toString().trim());
        };
        process.stdin.resume();
        process.stdin.setEncoding('utf8');
        process.stdout.write('\x1b[31mAre you sure? (yes/no) \x1b[0m');
        process.stdin.on('data', onData);
      });

      if (confirmInput.toLowerCase() === 'yes') {
        console.log('Deleting team table...');
        await db.delete(team);
        await db.delete(teamMember);
        console.log('🗑️ Team table deleted!');
      }
    }

    const file = fs.readFileSync('src/db/seed/Seed - Team.csv', 'utf8');
    const lines = file.split('\n');
    lines.shift();
    const teams = lines.map(async (line) => {
      const [
        competition_title,
        team_name,
        team_code,
        is_verified,
        team_member_email,
        team_leader_email,
      ] = line.replace('\r', '').split(',');

      const teamMemberData = team_member_email.split('•');
      const teamMemberId = await db
        .select()
        .from(user)
        .where(inArray(user.email, teamMemberData));
      const teamLeaderId = await db
        .select()
        .from(user)
        .where(eq(user.email, team_leader_email))
        .then(first);

      const competitionRes = await db
        .select()
        .from(competition)
        .where(eq(competition.title, competition_title))
        .then(first);
      const competitionId = competitionRes?.id ?? '';

      const teamId = createId();

      const teamRes = await db
        .insert(team)
        .values({
          id: teamId,
          competitionId,
          name: team_name,
          joinCode: team_code,
          isVerified: is_verified === 'TRUE',
        })
        .returning()
        .then(first);

      const teamLeaderRes = await db
        .insert(teamMember)
        .values({ teamId, userId: teamLeaderId?.id ?? '', role: 'leader' })
        .returning()
        .then(first);

      const teamMemberRes = teamMemberId.map(async (member) => {
        const res = await db
          .insert(teamMember)
          .values({ teamId, userId: member.id ?? '', role: 'member' })
          .returning()
          .then(first);
        return res;
      });

      const teamMembers = await Promise.all(teamMemberRes);

      return { teamRes, teamLeaderRes, teamMembers };
    });

    // eslint-disable-next-line
    const res = await Promise.all(teams);

    process.stdin.pause();
    process.stdin.removeAllListeners('data');

    // console.log(res);
    console.log('✅ Teams seeding success!');
  } catch (err) {
    throw '❌ Error seeding teams!';
  }
}

async function seedTimelines() {
  try {
    // Ask if the user wants to delete the table
    const userInput = await new Promise<string>((resolve) => {
      process.stdin.resume();
      process.stdin.setEncoding('utf8');
      process.stdout.write(
        'Do you want to delete the competition timeline table? (yes/no) ',
      );
      process.stdin.on('data', (data) => {
        resolve(data.toString().trim());
      });
    });

    if (userInput.toLowerCase() === 'yes') {
      // Ask user for confirmation
      const confirmInput = await new Promise<string>((resolve) => {
        const onData = (data: string) => {
          resolve(data.toString().trim());
        };
        process.stdin.resume();
        process.stdin.setEncoding('utf8');
        process.stdout.write('\x1b[31mAre you sure? (yes/no) \x1b[0m');
        process.stdin.on('data', onData);
      });

      if (confirmInput.toLowerCase() === 'yes') {
        console.log('Deleting competition timeline table...');
        await db.delete(competitionTimeline);
        console.log('🗑️ Competition Timeline table deleted!');
      }
    }

    const file = fs.readFileSync('src/db/seed/Seed - Timeline.csv', 'utf8');
    const lines = file.split('\n');
    lines.shift();
    const timelines = lines.map(async (line) => {
      const [competition_name, title, start_date, end_date, hide] = line
        .replace('\r', '')
        .split(',');

      const competition_id = await db
        .select()
        .from(competition)
        .where(eq(competition.title, competition_name))
        .then(first);

      const startDate = start_date ? new Date(start_date) : new Date();
      const endDate = end_date ? new Date(end_date) : null;

      const res = await db
        .insert(competitionTimeline)
        .values({
          competitionId: competition_id?.id ?? '',
          title,
          startDate,
          showOnLanding: hide === 'TRUE',
          showTime: hide === 'TRUE',
          endDate,
        })
        .returning()
        .then(first);

      return res;
    });

    // eslint-disable-next-line
    const res = await Promise.all(timelines);

    process.stdin.pause();
    process.stdin.removeAllListeners('data');

    // console.log(res);
    console.log('✅ Competition Timeline seeding success!');
  } catch (err) {
    throw '❌ Error seeding timelines!';
  }
}

// eslint-disable-next-line
async function seedSubmissionRequirement() {
  try {
    // Ask if the user wants to delete the table
    const userInput = await new Promise<string>((resolve) => {
      process.stdin.resume();
      process.stdin.setEncoding('utf8');
      process.stdout.write(
        'Do you want to delete the competition submission requirement table? (yes/no) ',
      );
      process.stdin.on('data', (data) => {
        resolve(data.toString().trim());
      });
    });

    if (userInput.toLowerCase() === 'yes') {
      // Ask user for confirmation
      const confirmInput = await new Promise<string>((resolve) => {
        const onData = (data: string) => {
          resolve(data.toString().trim());
        };
        process.stdin.resume();
        process.stdin.setEncoding('utf8');
        process.stdout.write('\x1b[31mAre you sure? (yes/no) \x1b[0m');
        process.stdin.on('data', onData);
      });

      if (confirmInput.toLowerCase() === 'yes') {
        console.log('Deleting competition submission requirement table...');
        await db.delete(competitionSubmissionRequirement);
        console.log('🗑️ Competition submission requirement table deleted!');
      }
    }

    const file = fs.readFileSync(
      'src/db/seed/Seed - Submission Requirement.csv',
      'utf8',
    );
    const lines = file.split('\n');
    lines.shift();
    const timelines = lines.map(async (line) => {
      const [competition_name, name, description, start_date, deadline, stage] =
        line.replace('\r', '').split(',');

      const competition_id = await db
        .select()
        .from(competition)
        .where(eq(competition.title, competition_name))
        .then(first);

      const startDate = start_date ? new Date(start_date) : new Date();
      const endDate = deadline ? new Date(deadline) : new Date();
      const stage_ = stage as 'pre-eliminary' | 'final' | 'verification';

      const res = await db
        .insert(competitionSubmissionRequirement)
        .values({
          competitionId: competition_id?.id ?? '',
          typeName: name,
          startDate,
          description,
          deadline: endDate,
          stage: stage_,
        })
        .returning()
        .then(first);

      return res;
    });

    // eslint-disable-next-line
    const res = await Promise.all(timelines);

    process.stdin.pause();
    process.stdin.removeAllListeners('data');

    // console.log(res);
    console.log('✅ Competition Submission Requirement seeding success!');
  } catch (err) {
    console.log(err);
    throw '❌ Error seeding competition submission requirement!';
  }
}

async function main() {
  // await seedUsers();
  await seedCompetitions();
  // await seedMedias();
  // await seedTeams();
  await seedTimelines();
  // await seedSubmissionRequirement();
}

if (require.main === module) {
  await main();
  exit();
}
