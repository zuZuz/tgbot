const config = require('./config');
const mysql = require('mysql');
const logger = require('./logger');

const pool = new mysql.createPool({
  host: config.dbHost,
  user: config.dbUser,
  password: config.dbPass,
  database: config.dbName
});

const db = {};

function query (sql, params, callback) {
  pool.getConnection(function onGetConnectionCb (err, con) {
    if (err) {
      logger.error(err.message);
      callback(err);
      return;
    }

    let q = con.query(sql, params, function onQueryCallback (err, rows) {
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
db.users.insert = (id, callback) => {
  let sql = 'INSERT INTO `tlgrm_users` (`id`, `is_paid`) VALUES (?, ?)';
  query(sql, [id, false], callback);
};

db.users.find = (id, callback) => {
  let sql = 'SELECT `id`, `is_paid` FROM `tlgrm_users` WHERE `id` = ?';
  query(sql, id, callback);
};

db.users.update = (id, is_paid, callback) => {
  let sql = 'UPDATE `tlgrm_users` SET `is_paid` = ? WHERE `id` = ?';
  query(sql, [is_paid, id], callback);
};

db.referrals = {};
db.referrals.insert = (referral_id, referrer_id, callback) => {
  let sql = 'REPLACE INTO `referrals` SET `referral_id` = ?, `referrer_id` = ?';
  query(sql, [referral_id, referrer_id], callback)
};

db.referrals.find = (id, callback) => {
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
  let sql = 'SELECT * FROM `bonuses`';
  query(sql, null, callback);
};

db.bonuses.findOne = (id, callback) => {
  let sql = 'SELECT * FROM `bonuses` WHERE `id` = ?';
  query(sql, id, callback);
};

db.bonuses.update = (id, amount, callback) => {
  let sql = 'UPDATE `bonuses` SET `amount` = ? WHERE `id` = ?';
  query(sql, [id, amount], callback);
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

db.query = query;
db.end = () => pool.end();
module.exports = db;