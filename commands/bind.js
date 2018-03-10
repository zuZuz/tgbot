require('../utils');
const db = require('../db');

function isInt(value) {
  const er = /^-?[0-9]+$/;
  return er.test(value);
}

function onBindCommand(ctx) {
  db.bonuses.findOne(ctx.from.id, function onFind (err, rows) {
    if (err) {
      return;
    }
    if (rows.length === 0) {
      return ctx.reply('Вы не зарегистрированы как реферер');
    }

    let input = ctx.update.message.text.split(' ');

    if (!isInt(input[1])) {
      return ctx.reply('Номер qiwi-кошелька некорректен');
    }

    db.bonuses.updatePhone(ctx.from.id, input[1], () => {
      ctx.reply('qiwi-кошелёк успешно обновлён');
    });
  })
}

module.exports = onBindCommand;