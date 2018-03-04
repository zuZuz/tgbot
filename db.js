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

function query(sql, params, callback) {
  pool.getConnection((err, con) => {
    if (err) {
      logger.error(err.message);
      callback(err);
      return;
    }

    con.query(sql, params, (err, rows) => {
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
  query(sql, [id], callback);
};

db.users.update = (id, is_paid, callback) => {
  let sql = 'UPDATE `tlgrm_users` SET `is_paid` = ? WHERE `id` = ?';
  query(sql, [is_paid, id], callback);
};

db.end = () => pool.end();
module.exports = db;