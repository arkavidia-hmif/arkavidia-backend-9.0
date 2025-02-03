import { competitionErrorEmailCron } from './comp-error-email.cron';

export function setupCron() {
  if (
    process.env.NODE_ENV === 'production' ||
    process.env.NODE_ENV === 'staging'
  ) {
    competitionErrorEmailCron.start();
  }
}
