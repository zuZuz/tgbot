require('./utils');
const config = require('./config');
const logger = require('./logger');
const db = require('./db');
const lc = require('./locale');
const tgutils = require('./tgutils');
const commands = require('./commands');

const telegraf = require('telegraf');
const extra = require('telegraf/extra');
const app = require('./http');

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

bot.catch(function onBotError (err) {
  logger.error(err.message);
});

bot.start(function onStartCommand (ctx) {
  logger.info('started: %d', ctx.from.id);
  return ctx.reply(lc.start);
});

bot.command(
  ['pay', 'pay@{0}'.format(config.botDomain)],
  commands.pay
);

bot.command(
  ['invite', 'invite@{0}'.format(config.botDomain)],
  commands.invite
);

bot.command(
  ['amount', 'amount@{0}'.format(config.botDomain)],
  commands.amount
);

bot.on('text', function onText (ctx) {
  let id = ctx.chat.id;
  let repliedMessage = null;

  if (id < 0) {
    repliedMessage = extra.inReplyTo(ctx.message.message_id);
  }
  return ctx.telegram.sendMessage(id, lc.splash, repliedMessage);
});

bot.on(
  ['group_chat_created', 'new_chat_members'],
  function onGroupEntered (ctx) {
  if (!tgutils.isBotEntered(ctx)) {
    return;
  }
  tgutils.getChatCreator(ctx, function findCreator(err, creator) {
    if (err || creator === undefined) {
      ctx.reply('Возникла ошибка. Невозможно найти создателя группы.');
      bot.telegram.leaveChat(ctx.chat.id).
        then(null, function onRejected (err) {
          logger.error(err.message);
        });
      return;
    }

    db.bonuses.findOne(creator.id, function onFind(err, rows) {
      if (rows.length !== 0) {
        bot.telegram.sendMessage(creator.id, 'Группа успешно добавлена');
        return;
      }
      db.bonuses.insert(creator.id, function onInsertError (err) {
        if (err) {
          logger.info(creator.id);
          return;
        }
        bot.telegram.sendMessage(creator.id, 'Вы зарегистрированы как реферер');
      });
    });
  });
});

app.listen(app.get('port'), function http () {
  logger.info('starting http');
});

bot.startPolling();