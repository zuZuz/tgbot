const tgutils = require('../tgutils');
const lc = require('../locale');

function onInviteCommand (ctx) {
  tgutils.sendToChat(ctx, lc.warning);
  return tgutils.sendInvite(ctx.from.id);
}

module.exports = onInviteCommand;