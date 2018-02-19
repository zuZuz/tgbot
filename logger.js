const utils = require('./utils');
const config = require('./config');
const moment = require('moment');
const winston = require('winston');

const winstonCfg = winston.config;
const dateFormat = moment().format(config.logDateFormat).trim();

const logger = new winston.Logger({
    level: config.logLevel,
    transports: [
        new winston.transports.File({filename: config.logFile}),
        new winston.transports.Console({
            timestamp: dateFormat,
            formatter: function(options) {
                return '[{0}] [{1}]: {2}'.format(
                    options.timestamp,
                    winstonCfg.colorize(options.level, options.level.toUpperCase()),
                    options.message ? options.message : 'No message');
            }
        })
    ]
});

logger.info = function(message) {
    logger.log('info', message);
}

logger.error = function(message) {
    logger.log('error', message);
}


module.exports = logger;