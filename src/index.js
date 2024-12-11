require('dotenv').config();
const app = require('./app');
const { logger } = require('./app/services/logger');

app
  .default()
  .catch((e) => (logger ? logger.error(e) : console.error(e)))
  .finally(app.clear);
