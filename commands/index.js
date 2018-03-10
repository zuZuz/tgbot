const commands = {};

commands.pay = require('./pay');
commands.invite = require('./invite');
commands.amount = require('./amount');
commands.refs = require('./refs');
commands.bind = require('./bind');
commands.payout = require('./pay-out');

module.exports = commands;