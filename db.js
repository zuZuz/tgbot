var config = require('./config');
var mysql = require('mysql');

var con = new mysql.createConnection({
    host: config.dbHost,
    user: config.dbUser,
    password: config.dbPass,
    database: config.dbName
});

var db = {};

db.find = (id, callback) => {
    var res = con.query(
        'SELECT `id`, `is_paid` FROM `tlgrm_users` WHERE `id` = ?', 
        [id],
        callback
    );
};

db.save = (id, callback) => {

    if (db.find(id) != undefined) {
        return;
    }

    con.query(
        'INSERT INTO tlgrm_users (id, is_paid) VALUES (?, ?)', 
        [id, false]
    );
};

db.update = (id, is_paid, callback) => {
    con.query(
        'UPDATE `tlgrm_users` SET `is_paid` = ? WHERE `id` = ?',
        [is_paid, id],
        callback
    );
};

setInterval(() => {
    con.query(
        'SELECT 1',
        (err, rows) => {
            if (err) {
                logger.error(err.message);
            }
        }
    )
}, 60000);

db.connect = con.connect;
db.end = () => con.end();
module.exports = db;