import { logger } from './services/logger';
import { processAoF } from './services/aof';

const main = async () => {
  await processAoF();
  logger.info('Completed');
};

export default main;
export const clear = async () => {
  logger.info('Clearing');
  logger.clear();
};
