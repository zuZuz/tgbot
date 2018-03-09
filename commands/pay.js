require('../utils');
const db = require('../db');
const lc = require('../locale');
const tgutils = require('../tgutils');
const config = require('../config');

const extra = require('telegraf/extra');
const markup = require('telegraf/markup');

function onPayCommand (ctx) {
  let userId = ctx.from.id;
  db.users.find(userId, function onFindCallback(err, users) {
    if (err) {
      logger.error(err.message);
      return;
    }

    if (users[0] !== undefined && users[0].is_paid) {
      return ctx.chat.id < 0 ?
        replyTo(ctx, lc.alreadyPaid) : ctx.reply(lc.alreadyPaid);
    }

    if (users[0] === undefined) {
      db.users.insert(userId, function onInsertError(err) {
      });
    }

    if (ctx.chat.id < 0) {
      tgutils.getChatCreator(ctx, function findCreator(err, creator) {
        if (err || creator === undefined) {
          return;
        }

        db.referrals.insert(userId, creator.id, () => {
        });
      });
    }

    const e = extra.markup(markup.inlineKeyboard([
      markup.urlButton('Яндекс.Касса', config.invoiceLink.format(userId)),
      markup.urlButton('Робокасса', config.invoiceRK.format(userId))
    ]));
    e.caption = 'Invoice Link';

    tgutils.sendToChat(ctx, lc.warningPay);
    return ctx.telegram.sendMessage(userId, lc.invoiceMessage, e);
  });
}

module.exports = onPayCommand;