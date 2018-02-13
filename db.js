var JsonDB = require('node-json-db');

var dbs = new JsonDB('users.json', true, false);
var db = {};

db.save = (user) => {
    dbs.push('/' + user.id.toString(), {id: user.id, isPaid: false});
};

db.find = (user) => {
    var res = undefined;
    try {
        res = dbs.getData('/' + user.id.toString());
    } catch (err) {
        res = undefined;
    }

    return res;
};

db.update = (user, newData) => {
    dbs.push('/' + user.id.toString(), {id: user.id, isPaid: newData.isPaid});
};

module.exports = db;