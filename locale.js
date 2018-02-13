const locale = {};

/* текст, отправляющийся пользователю по команде старт */
locale.start = "Welcome!\nYou're new";

/* текст на кнопке */
locale.button = "❤ Click me ❤";

/* сообщение, если ещё не оплачено */
locale.notPaid = "You haven't paid yet";

/* сообщение, с которым будет отправлена кнопка */
locale.linkMsg = "Your invite link";

/* предупреждение о том, что пользователь должен разрешить писать боту */
locale.warning = "Warning: you need to send /start so that the bot can send you a message";

/* сообщение после успешной оплаты */
locale.paySuccess = "You paid successfully!\n" + locale.warning;

locale.alreadyPaid = 'You already paid';

/* стандартное сообщение */
locale.splash = "Please use commands /pay or /invite";

module.exports = locale;