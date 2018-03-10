require('dotenv').config();
const config = {};

config.botToken = process.env.BOT_TOKEN || '{not_token}';
config.botDomain = process.env.BOT_DOMAIN || '{not_domain}';
config.inviteLink = 'https://t.me/joinchat/Ff6qslGKXErGsxAPDzpsqw';

config.logDateFormat = 'DD-MM-YYYY hh:mm:ss';
config.logFile = 'bot.log';
config.logLevel = 'info';

config.invoiceLink = 'https://livefood.store/?tg_id={0}';
config.invoiceRK = 'https://livefood.store/?ps=rk&tg_id={0}';

config.dbHost = process.env.DB_HOST || '{not_host}';
config.dbUser = process.env.DB_USER || '{not_user}';
config.dbPass = process.env.DB_PASS || '{not_pass}';
config.dbName = process.env.DB_NAME || '{not_name}';

config.httpToken = 'Gh75fe1r23';
config.httpPort = 8888;
config.httpName = 'admin';
config.httpPass = 'Hm1zBXmh2';

module.exports = config;