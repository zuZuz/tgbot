const utils = require('./utils');
const config = require('./config');
const moment = require('moment');
const winston = require('winston');

const winstonCfg = winston.config;

// noinspection JSUnusedGlobalSymbols
const logger = new winston.Logger({
  level: config.logLevel,
  transports: [
    new winston.transports.File({filename: config.logFile}),
    new winston.transports.Console({
      timestamp: () => moment().format(config.logDateFormat).trim(),
      formatter: function(options) {
        return '[{0}] [{1}]: {2}'.format(
          options.timestamp(),
          winstonCfg.colorize(
            options.level,
            options.level.toUpperCase()
          ),
          options.message ? options.message : 'No message');
      }
    })
  ]
});

logger.info = (message) => {
  logger.log('info', message);
};

logger.error = (message) => {
  logger.log('error', message);
};

module.exports = logger;