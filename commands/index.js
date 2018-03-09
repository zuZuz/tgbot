const commands = {};

commands.pay = require('./pay');
commands.invite = require('./invite');
commands.amount = require('./amount');
//commands.payout = require('./pay-out');

module.exports = commands;