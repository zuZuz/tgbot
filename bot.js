const config = require('./config');
const utils = require('./utils');
const logger = require('./logger');
const db = require('./db');
const lc = require('./locale');
const util = require('./utils'); 


const telegraf = require('telegraf');
const extra = require('telegraf/extra');
const markup = require('telegraf/markup');
const http = require('http');

/* signal handling */

function handle() {
  logger.info('terminating bot');
  db.end();
  bot.stop();
  process.exit();
}

process.on('SIGTERM', handle);
process.on('SIGINT', handle);
process.on('SIGHUP', handle);
process.on('SIGQUIT', handle);

/* end of signal handling */

const bot = new telegraf(config.botToken);

bot.catch((err) => {
  logger.error(err.message);
});

bot.start((ctx) => {
  logger.info('started: %d', ctx.from.id);
  return ctx.reply(lc.start);
});

function sendInvite(id) {
  db.find(id, (err, rows) => {
    if (err) {
      logger.error(err.message);
      return;
    }

    let from = rows[0];

    const e = extra.markup(markup.inlineKeyboard([
      markup.urlButton(lc.button, config.inviteLink)
    ]));
    e.caption = 'Invite Link';

    if (from !== undefined && from.is_paid) {
      return bot.telegram.sendMessage(id, lc.linkMsg, e);
    } else {
      return bot.telegram.sendMessage(id, lc.notPaid);
    }
  });
}

function replyTo(ctx, message) {
  return ctx.reply(message, extra.inReplyTo(ctx.message.message_id));
}

bot.command(['pay', 'pay@{0}'.format(config.botDomain)], (ctx) => {
  db.find(ctx.from.id, (err, rows) => {
    if (err) {
      logger.error(err.message);
      return;
    }

    let user = rows[0];

    if (user !== undefined && user.is_paid) {
      if (ctx.chat.id < 0) {
        return replyTo(ctx, lc.alreadyPaid);
      } else {
        return ctx.reply(lc.alreadyPaid);
      }
    }

    if (user === undefined) {
      db.save(ctx.from.id, (err) => {
        if (err) {
          logger.error(err.message);
        }
      });
    }

    const e = extra.markup(markup.inlineKeyboard([
      markup.urlButton('Яндекс.Касса', config.invoiceLink.format(ctx.from.id)),
      markup.urlButton('Робокасса', config.invoiceRK.format(ctx.from.id))
    ]));
    e.caption = 'Invoice Link';

    if (ctx.chat.id < 0) {
      replyTo(ctx, lc.warningPay);
    }
    
    return bot.telegram.sendMessage(ctx.from.id, lc.invoiceMessage, e);
   });
});

bot.command(['invite', 'invite@{0}'.format(config.botDomain)], (ctx) => {
  if (ctx.chat.id < 0) {
    replyTo(ctx, lc.warning);
  }

  return sendInvite(ctx.from.id);
});

bot.on('text', (ctx) => {
  let id = ctx.chat.id;
  let repliedMessage = null;

  if (id < 0) {
    repliedMessage = extra.inReplyTo(ctx.message.message_id);
  }
  return ctx.telegram.sendMessage(id, lc.splash, repliedMessage);
});

http.createServer((req, res) => {
  let params = req.url.split('/');
  let id = parseInt(params[1]);

  if (params[2] === config.httpToken && !isNaN(id)) {
    db.update(id, true, (err) => {
      if (err) {
        logger.error(err.message);
        return;
      }

      sendInvite(id);
    });
  }

  res.end();
}).listen(config.httpPort);

bot.startPolling();