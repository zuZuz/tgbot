require('dotenv');
const config = {};

config.botToken = process.env.BOT_TOKEN || '470912859:AAE_kgtGhN4CTytMj2ScYYfZ8n9YG3Dh4xE';
config.botDomain = process.env.BOT_DOMAIN || 'gladoss_bot';
config.inviteLink = 'https://t.me/joinchat/Ff6qslGKXErGsxAPDzpsqw';

config.logDateFormat = 'DD-MM-YYYY hh:mm:ss';
config.logFile = 'bot.log';
config.logLevel = 'info';

config.invoiceLink = 'https://livefood.store/?tg_id={0}';
config.invoiceRK = 'https://livefood.store/?ps=rk&tg_id={0}';

config.dbHost = process.env.DB_HOST || '176.57.208.72';
config.dbUser = process.env.DB_USER || 'responder';
config.dbPass = process.env.DB_PASS || 'YOaXicDdwxa4J68n';
config.dbName = process.env.DB_NAME || 'responder';

config.httpToken = 'Gh75fe1r23';
config.httpPort = 8080;

module.exports = config;
