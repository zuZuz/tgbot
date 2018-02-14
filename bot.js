const config = require('./config');
const logger = require('./logger');
const db = require('./db');
const lc = require('./locale');

const util = require('util'); 

const telegraf = require('telegraf');
const extra = require('telegraf/extra');
const markup = require('telegraf/markup');
const http = require('http');

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

function sendInvite(id) {
    var from = db.find(id);

    const e = extra.markup(markup.inlineKeyboard([
        markup.urlButton(lc.button, config.inviteLink)
    ]));
    e.caption = 'Invite Link';

    if (from.is_paid) {
        return bot.telegram.sendMessage(id, lc.linkMsg, e);
    } else {
        return bot.telegram.sendMessage(id, lc.notPaid);
    }
};

function replyTo(ctx, message) {
    return ctx.reply(message, extra.inReplyTo(ctx.message.message_id));
}

bot.command(['pay', 'pay@{0}'.format(config.botDomain)], (ctx) => {
    const user = db.find(ctx.from.id);

    if (user !== undefined && user.is_paid) {
        if (ctx.chat.id < 0) {
            return replyTo(ctx, lc.alreadyPaid);
        } else {
            return ctx.reply(lc.alreadyPaid);
        }
    }

    db.save(ctx.from.id);
    return replyTo(ctx, lc.invoiceMessage.format(
        config.invoiceLink.format(ctx.from.id)));
});

bot.command(['invite', 'invite@{0}'.format(config.botDomain)], (ctx) => {
    if (ctx.chat.id < 0) {
        replyTo(ctx, lc.warning);
    }
    
    return sendInvite(ctx.from.id);
});

bot.on('text', (ctx) => {
    var id = ctx.chat.id;
    var repliedMessage = null;

    if (id < 0) {
        repliedMessage = extra.inReplyTo(ctx.message.message_id);
    }
    return ctx.telegram.sendMessage(id, lc.splash, repliedMessage);
});

http.createServer((req, res) => {
    var params = req.url.split('/');
    var id = parseInt(params[1]);

    if (params[2] == config.httpToken && !isNaN(id)) {
        db.update(id, true);
        sendInvite(id);
    }

    res.end();
}).listen(config.httpPort);

bot.startPolling();