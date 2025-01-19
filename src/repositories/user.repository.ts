import { and, eq } from 'drizzle-orm';
import type { z } from 'zod';
import type { Database } from '~/db/drizzle';
import { first } from '~/db/helper';
import { user } from '~/db/schema/user.schema';
import {
  UserDocumentTypeEnum,
  userDocument,
} from '~/db/schema/verification.schema';
import type {
  CreateUserDocumentSchema,
  UpdateUserDocumentSchema,
  UserUpdateSchema,
} from '~/types/user.type';

/** USER DOCUMENT REPOSITORIES */

export const getUserDocument = async (
  db: Database,
  userId: string,
  type: UserDocumentTypeEnum,
) => {
  return db.query.userDocument.findFirst({
    where: and(eq(userDocument.userId, userId), eq(userDocument.type, type)),
  });
};

export const createUserDocument = async (
  db: Database,
  userId: string,
  values: z.infer<typeof CreateUserDocumentSchema>,
) => {
  return db
    .insert(userDocument)
    .values({ ...values, userId })
    .returning();
};

export const updateUserDocument = async (
  db: Database,
  userId: string,
  values: z.infer<typeof UpdateUserDocumentSchema>,
) => {
  return db
    .update(userDocument)
    .set(values)
    .where(eq(userDocument.userId, userId))
    .returning();
};

export const isUserDocumentsVerified = async (db: Database, userId: string) => {
  const documents = await db.query.userDocument.findMany({
    where: eq(userDocument.userId, userId),
  });

  const verifyTypes = ['kartu-identitas', 'nisn'];
  const foundTypes: string[] = [];

  if (documents.length !== 2) return false;
  if (!documents[0].isVerified || !documents[1].isVerified) return false;

  foundTypes.push(documents[0].type);
  foundTypes.push(documents[1].type);

  const allTypesFound = verifyTypes.every((type) => foundTypes.includes(type));
  return allTypesFound;
};

/** USER DOCUMENT REPOSITORIES */

interface UserRelationOption {
  document?: boolean;
}

export const findUserByEmail = async (
  db: Database,
  email: string,
  options?: UserRelationOption,
) => {
  return db.query.user.findFirst({
    where: eq(user.email, email),
    with: {
      document: options?.document ? { with: { media: true } } : undefined,
    },
  });
};

export const getUser = async (
  db: Database,
  id: string,
  options?: UserRelationOption,
) => {
  return db.query.user.findFirst({
    where: eq(user.id, id),
    with: {
      document: options?.document ? { with: { media: true } } : undefined,
    },
  });
};

export const updateUser = async (
  db: Database,
  userId: string,
  userData: z.infer<typeof UserUpdateSchema>,
) => {
  return await db
    .update(user)
    .set(userData)
    .where(eq(user.id, userId))
    .returning()
    .then(first);
};

export const updateKartuUser = async (
  db: Database,
  userId: string,
  kartuMediaId: string,
) => {
  const kartu = await getUserDocument(db, userId, 'kartu-identitas');
  if (kartu) {
    await updateUserDocument(db, userId, { mediaId: kartuMediaId });
  } else {
    await createUserDocument(db, userId, {
      mediaId: kartuMediaId,
      type: 'kartu-identitas',
    });
  }
};

export const updateNisnUser = async (
  db: Database,
  userId: string,
  nisnMediaId: string,
) => {
  const nisn = await getUserDocument(db, userId, 'nisn');
  if (nisn) {
    await updateUserDocument(db, userId, { mediaId: nisnMediaId });
  } else {
    await createUserDocument(db, userId, {
      mediaId: nisnMediaId,
      type: 'nisn',
    });
  }
};
