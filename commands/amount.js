require('../utils');
const db = require('../db');

const extra = require('telegraf/extra');

function onAmountCommand (ctx) {
  if (ctx.chat.id < 0) {
    ctx.reply(
      'Команда разрешена только в личных сообщениях',
      extra.inReplyTo(ctx.message.message_id)
    );
    return;
  }

  db.bonuses.findOne(ctx.from.id, function onFindCallback (err, rows) {
    if (err) {
      ctx.reply('Произошла внутренняя ошибка');
      return;
    }

    if (rows.length === 0) {
      ctx.reply('Вы не зарегистрированы как реферер');
      return;
    }

    let row = rows[0];

    ctx.reply('На счету:\t {0} руб.\n'.format(row.amount - row.paid_out) +
              'Выплачено:\t {0} руб.\n'.format(row.paid_out));
  });
}

module.exports = onAmountCommand;