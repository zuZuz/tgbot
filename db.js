const config = require('./config');
const mysql = require('mysql');
const logger = require('./logger');

const pool = new mysql.createPool({
  host: config.dbHost,
  user: config.dbUser,
  password: config.dbPass,
  database: config.dbName,
  multipleStatements: true
});

const db = {};

function query (sql, params, callback) {
  pool.getConnection(function onGetConnectionCb (err, con) {
    if (err) {
      logger.error(err.message);
      callback(err);
      return;
    }

    con.query(sql, params, function onQueryCallback (err, rows) {
        con.release();
        if (err) {
          logger.error(err.message);
          callback(err);
          return;
        }

        callback(null, rows);
      }
    );
  });
}

db.users = {};
db.users.insert = (id, first, last, callback) => {
  let sql = 'INSERT INTO `tlgrm_users` (`id`, `is_paid`, `first_name`, `last_name`) VALUES (?, ?, ?, ?)';
  query(sql, [id, false, first, last], callback);
};

db.users.find = (id, callback) => {
  let sql = 'SELECT * FROM `tlgrm_users` WHERE `id` = ?';
  query(sql, id, callback);
};

db.users.update = (id, first, last, callback) => {
  let sql = 'UPDATE `tlgrm_users` SET `first_name` = ?, `last_name` = ? WHERE `id` = ?';
  query(sql, [first, last, id], callback);
};

db.referrals = {};
db.referrals.insert = (referral_id, referrer_id, callback) => {
  let sql = 'REPLACE INTO `referrals` SET `referral_id` = ?, `referrer_id` = ?';
  query(sql, [referral_id, referrer_id], callback)
};

db.referrals.find = (id, callback) => {
  let sql = 'SELECT * FROM `referrals` WHERE `referrer_id` = ?';
  query(sql, id, callback);
};

db.referrals.findOne = (id, callback) => {
  let sql = 'SELECT * FROM `referrals` WHERE `referral_id` = ?';
  query(sql, id, callback);
};

db.referrals.update = () => {
  // TODO
};

db.bonuses = {};
db.bonuses.insert = (id, callback) => {
  let sql = 'INSERT INTO `bonuses` (`id`, `amount`, `paid_out`) VALUES (?, 0, 0)';
  query(sql, id, callback);
};

db.bonuses.find = (callback) => {
  let sql = 'SELECT *FROM bonuses, tlgrm_users WHERE bonuses.id = tlgrm_users.id';
  query(sql, null, callback);
};

db.bonuses.findOne = (id, callback) => {
  let sql = 'SELECT * FROM `bonuses` WHERE `id` = ?';
  query(sql, id, callback);
};

db.bonuses.updatePhone = (id, phone, callback) => {
  let sql = 'UPDATE `bonuses` SET `phone` = ? WHERE `id` = ?';
  query(sql, [phone, id], callback);
};

db.bonuses.update = (id, sum, callback) => {
  let sql = 'UPDATE `bonuses` SET `paid_out` = ? WHERE `id` = ?';
  query(sql, [sum, id], callback);
};

db.levels = {};
db.levels.insert = (level, bonus, callback) => {
  let sql = 'INSERT INTO `levels` (`level`, `bonus`) VALUES (?, ?)';
  query(sql, [level, bonus], callback);
};

db.levels.find = (callback) => {
  let sql = 'SELECT * FROM `levels`';
  query(sql, callback);
};

db.levels.update = (level, bonus, callback) => {
  let sql = 'UPDATE `levels` SET `bonus` = ? WHERE `level` = ?';
  query(sql, [bonus, level], callback);
};

db.levels.delete = (level, callback) => {
  let sql = 'DELETE FROM `levels` WHERE `level` = ?';
  query(sql, level, callback);
};

db.settings = {};
db.settings.find = (callback) => {
  let sql = 'SELECT * FROM `ref_settings`';
  query(sql, null, callback);
};

db.settings.update = (settings, callback) => {
  let sql = 'UPDATE `ref_settings` SET ?';
  query(sql, settings, callback);
};

db.orders = {};
db.orders.insert = (id, sum, callback) => {
  let sql = 'INSERT INTO `orders` (`id`, `sum`) VALUES (?, ?);'+
            'UPDATE `bonuses` SET `paid_out` = `paid_out` + ? WHERE id = ?';
  query(sql, [id, sum, sum, id], callback);
};

db.orders.find = (callback) => {
  let sql = 'SELECT orders._id, orders.id, sum, date, first_name, last_name ' +
    'FROM `orders`, tlgrm_users WHERE `status` = 0 AND orders.id = tlgrm_users.id';
  query(sql, null, callback);
};

db.orders.update = (id, status, callback) => {
  let sql = 'UPDATE `orders` SET status = ? WHERE _id = ?';
  query(sql, [status, id], callback);
};

db.query = query;
db.end = () => pool.end();
module.exports = db;