import { eq } from 'drizzle-orm';
import { Database } from '~/db/drizzle';
import { voucer } from '~/db/schema';

interface VoucerRelationOption {
  team?: boolean;
}

export const getVoucerByCode = async (
  db: Database,
  code: string,
  options?: VoucerRelationOption,
) => {
  return db.query.voucer.findFirst({
    where: eq(voucer.code, code),
    with: {
      team: options?.team ? true : undefined,
    },
  });
};
