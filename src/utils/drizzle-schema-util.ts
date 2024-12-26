import { init } from '@paralleldrive/cuid2';

export const createId = init({
  length: 8,
});

export const getNow = () => new Date();
