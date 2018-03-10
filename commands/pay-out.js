const db = require('../db');
const tgutils = require('../tgutils');

function isFloat(val) {
  const er = /^(?=.+)(?:[1-9]\d*|0)?(?:\.\d+)?$/;
  return er.test(val);
}

function onPayOutCommand (ctx) {
  db.bonuses.findOne(ctx.from.id, function onFind(err, rows) {
    if (err) {
      return;
    }
    if (rows.length === 0) {
      return ctx.reply('Вы не зарегистрированы как реферер');
    }

    if (rows[0].phone.length === 0) {
      return ctx.reply('Необходимо привязать qiwi-кошелёк');
    }

    let input = ctx.update.message.text.split(' ');

    if (!isFloat(input[1])) {
      return ctx.reply('Сумма некорректна');
    }

    let to_pay = parseFloat(input[1]);
    let amount = rows[0].amount;
    let paid_out = rows[0].paid_out;
    if ((amount - paid_out) < to_pay) {
      return ctx.reply('Запрошенная сумма превышает допустимую');
    }

    db.orders.insert(ctx.from.id, paid_out + to_pay, (err) => {
      if (err) {
        return;
      }

      ctx.reply(`Принят заказ на вывод суммы: ${to_pay} руб.\n` +
                `счёт: ${rows[0].phone}`);
    });
  });
}

module.exports = onPayOutCommand;