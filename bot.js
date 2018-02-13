const config = require('./config');
const logger = require('./logger');
const db = require('./db');
const lc = require('./locale');

const util = require('util'); 

const telegraf = require('telegraf');
const extra = require('telegraf/extra');
const markup = require('telegraf/markup');

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
    return ctx.reply(lc.start);
});

function sendInvite(ctx) {
    var from = db.find(ctx.from);

    const e = extra.markup(markup.inlineKeyboard([
        markup.urlButton(lc.button, config.inviteLink)
    ]));
    e.caption = 'caption text';

    var repliedMessage = null;
    if (ctx.chat.id < 0) {
        repliedMessage = extra.inReplyTo(ctx.message.message_id);
    };

    if (from == undefined || from.isPaid != true) {
        return ctx.reply(lc.notPaid, repliedMessage);
    }

    if (from.isPaid) {
        return ctx.telegram.sendMessage(ctx.from.id, lc.linkMsg, e);
    }
};

function replyTo(ctx, message) {
    ctx.reply(message, extra.inReplyTo(ctx.message.message_id));
}

bot.command(['pay', 'pay@{0}'.format(config.botDomain)], (ctx) => {
    const user = db.find(ctx.from);

    if (user !== undefined && user.isPaid) {
        if (ctx.chat.id < 0) {
            return replyTo(ctx, lc.alreadyPaid);
        } else {
            return ctx.reply(lc.alreadyPaid);
        }
    }

    db.save(ctx.from);
    db.update(ctx.from, {isPaid: true});

    if (ctx.chat.id < 0) {
        replyTo(ctx, lc.paySuccess);
    }

    return sendInvite(ctx);
});

bot.command(['invite', 'invite@{0}'.format(config.botDomain)], (ctx) => {
    if (ctx.chat.id < 0) {
        replyTo(ctx, lc.warning);
    }
    
    return sendInvite(ctx);
});

bot.on('text', (ctx) => {
    var id = ctx.chat.id;
    var repliedMessage = null;

    if (id < 0) {
        repliedMessage = extra.inReplyTo(ctx.message.message_id);
    }

    try {
        return ctx.telegram.sendMessage(id, lc.splash, repliedMessage);
    } catch (err) {
        logger.log('error', err.message);
    }
});

//bot.command('help', (ctx) => ctx.reply('Try send a sticker!'));
//bot.hears('hi', (ctx) => ctx.reply('Hey there!'));
//bot.hears('/bye/i', (ctx) => ctx.reply('Bye-bye!'));
//bot.on('sticker', (ctx) => ctx.reply('👍'));
bot.startPolling();