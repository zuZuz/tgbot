require('../utils');
const db = require('../db');

function onRefsCommand(ctx) {
  db.referrals.find(ctx.from.id, function onFind(err, rows) {
    let text = `Количество рефералов: ${rows.length}\nСписок: `;

    for (let i = 0; i < rows.length; i++) {
      let name = rows[i].first_name;
      let surname = rows[i].first_name;
      if (name === undefined && surname === undefined)
        continue;

      text += (name === undefined ? '' : name) + ' ' +
        (surname === undefined ? '' : surname) + '; ';
    }

    return ctx.reply(text + '\nМогут отображаться не все пользователи');
  });
}

module.exports = onRefsCommand;