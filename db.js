var config = require('./config');
var mysql = require('sync-mysql');

var con = new mysql ({
    host: config.dbHost,
    user: config.dbUser,
    password: config.dbPass,
    database: config.dbName
});

var db = {};

db.find = (id) => {
    var res = con.query(
        'SELECT `id`, `is_paid` FROM `tlgrm_users` WHERE `id` = ?', 
        [id],
        (err, res, f) => {
            if (err) {
                throw err;
            } 
        }
    );

    return res[0];
};

db.save = (id) => {

    if (db.find(id) != undefined) {
        return;
    }

    con.query(
        'INSERT INTO tlgrm_users (id, is_paid) VALUES (?, ?)', 
        [id, false]
    );
};

db.update = (id, is_paid) => {
    con.query(
        'UPDATE `tlgrm_users` SET `is_paid` = ? WHERE `id` = ?',
        [is_paid, id],
        (err, res, f) => {
            if (err) {
                throw err;
            }
        }
    );
};

module.exports = db;