const extra = require('telegraf/extra');
const markup = require('telegraf/markup');
const config = require('./config');
const logger = require('./logger');

const db = require('./db');
const lc = require('./locale');

const telegraf = require('telegraf');
const bot = new telegraf(config.botToken);

const tgutils = {};

tgutils.sendMessage = (id, text, extras) => {
  bot.telegram.sendMessage(id, text, extras);
};

tgutils.getChatCreator = (ctx, callback) => {
  let chatId = ctx.chat.id;
  let promise = ctx.getChatAdministrators(chatId);
  promise.then(
    function onFullFilled(users) {
      let user = users.find(function findCreator(obj) {
        if (obj.status === 'creator') {
          return true;
        }
      });

      callback(null, user === undefined ? undefined : user.user);
    },
    function onRejected(err) {
      logger.error(err.message);
      callback(err, null);
    }
  );
};

tgutils.sendToChat = (ctx, text) => {
  if (ctx.chat.id < 0) {
    return ctx.reply(text, extra.inReplyTo(ctx.message.message_id));
  }
};

tgutils.isBotEntered = (ctx) => {
  let members = ctx.update.message.new_chat_members;
  if (members === undefined) {
    return false;
  }

  let bot = members.find(function findBot(obj) {
    if (obj.username === config.botDomain) {
      return true;
    }
  });

  return bot !== undefined;
};

tgutils.sendInvite = (id) => {
  db.users.find(id, function onFindCallback (err, rows) {
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
      return tgutils.sendMessage(id, lc.linkMsg, e);
    } else {
      return tgutils.sendMessage(id, lc.notPaid);
    }
  });
};

module.exports = tgutils;