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

db.find = (id, callback) => {
  pool.getConnection((err, con) => {
    if (err) {
      logger.error(err.message);
      callback(err);
      return;
    }

    let sql = 'SELECT `id`, `is_paid` FROM `tlgrm_users` WHERE `id` = ?';
    con.query(sql, [id], (err, rows) => {
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
};

db.save = (id, callback) => {
  db.find(id, (err, rows) => {
    if (err) {
      logger.error(err.message);
      callback(err);
      return;
    }
    if (rows.length !== 0) {
      return;
    }

    pool.getConnection((err, con) => {
      if (err) {
        logger.error(err.message);
        callback(err);
        return;
      }
      let sql = 'INSERT INTO `tlgrm_users` (`id`, `is_paid`) VALUES (?, ?)';
      con.query(sql, [id, false], (err, rows) => {
          con.release();
          if (err) {
            logger.error(err);
            callback(err);
            return;
          }

          callback(null, rows);
        }
      );
    });
  });
};

db.update = (id, is_paid, callback) => {
  pool.getConnection((err, con) => {
    if (err) {
      logger.error(err.message);
      callback(err);
      return;
    }
    let sql = 'UPDATE `tlgrm_users` SET `is_paid` = ? WHERE `id` = ?';
    con.query(sql, [is_paid, id], (err, rows) => {
      con.release();
      if (err) {
        logger.error(err.message);
        callback(err);
        return;
      }

      callback(null, rows);
    });
  });
};

db.end = () => pool.end();
module.exports = db;