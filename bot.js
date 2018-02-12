const config = require('./config');
const moment = require('moment');
const telegraf = require('telegraf');
const util = require('util');
const winston = require('winston');

/* Logging part */

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

String.prototype.format = function(){
    var args = arguments;
    return this.replace(/\{(\d+)\}/g, function(m,n){
        return args[n] ? args[n] : m;
    });
};

/* end of Logging part */

/* signal handling */

function handle() {
    logger.log('info', 'terminating bot');
    bot.stop();
    process.exit();
};

process.on('SIGTERM', handle);
process.on('SIGINT', handle);
process.on('SIGHUP', handle);
process.on('SIGQUIT', handle);

/* end of signal handling */

const bot = new telegraf(config.botToken);

bot.catch((err) => {
    logger.log('error', err.stack);
});

bot.start((ctx) => {
    logger.log('info', 'started: %d', ctx.from.id);
    return ctx.reply('Welcome!');
});

bot.command('invoice', (ctx) => {
    ctx.reply('something here coming soon!');
})

bot.on('text', async (ctx) => {
    var id = ctx.from.id;

    if (ctx.chat) {
        id = ctx.chat.id;
    }

    logger.log('info', 'message from %d, text: %s', ctx.from.id, ctx.message);
    try {
        await ctx.telegram.sendCopy(ctx.from.id, ctx.message);
    } catch (err) {
        logger.log('error', err.message);
    }
})

//bot.command('help', (ctx) => ctx.reply('Try send a sticker!'));
//bot.hears('hi', (ctx) => ctx.reply('Hey there!'));
//bot.hears('/bye/i', (ctx) => ctx.reply('Bye-bye!'));
//bot.on('sticker', (ctx) => ctx.reply('👍'));
bot.startPolling();