require('../utils');
const config = require('../config');
const logger = require('../logger');
const tgutils = require('../tgutils');
const express = require('express');
const path = require('path');
const db = require('../db');
const session = require('express-session');

const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'static')));
app.set('port', config.httpPort);
app.use(session({
  secret: 'lkjg123h4g123',
  saveUninitialized: false,
  resave: false,
  cookie: {
    maxAge: 600000 * 24
  }
}));

app.post('/login', function (req, res) {
  if (req.body.pass === config.httpPass &&
    req.body.name === config.httpName) {
    req.session.authed = true;
    res.send(JSON.stringify({status: true}));
  } else {
    res.send(JSON.stringify({status: false}));
  }
});

app.get('/pay', function pay(req, res) {
  let id = parseInt(req.query.id);
  let sum = req.query.sum;
  let token = req.query.token;

  if (token !== config.httpToken) {
    res.send(JSON.stringify({error: 'invalid token'}));
  }

  if (isNaN(id)) {
    return;
  }

  db.query('CALL pay(?, ?)', [id, sum], function pay(err) {
    if (err) {
      tgutils.sendMessage(id, 'Произошла внутренняя ошибка при оплате');
      res.send(JSON.stringify({error: 'internal error'}));
      return;
    }
    tgutils.sendInvite(id);
    res.send(JSON.stringify({status: 'success'}));
  });
});

app.get('/getsum', function ref(req, res) {
  let id = req.query.id;
  db.referrals.find(id, function onFind (err, rows) {
    if (err) {
      res.send(JSON.stringify({error: 'internal error'}));
      return;
    }

    db.settings.find(function onFind (err, settings) {
      if (err) {
        res.send(JSON.stringify({error: 'internal error'}));
        return;
      }

      let sum = settings[0].amount;
      let bonus = settings[0].discount;
      if (rows.length !== 0) {
        sum = sum * (100.00 - bonus) / 100.00;
      }

      res.send(JSON.stringify({id: id, sum: sum}));
    });
  });
});

app.get('/', function (req, res) {
  if (req.session.authed) {
    res.sendFile(__dirname + '/index.html');
  } else {
    res.sendFile(__dirname + '/login.html');
  }
});

app.all('*', function(req, res, next) {
  if (req.session.authed) {
    next();
  } else {
    res.redirect('/');
  }
});

app.use(function(err, req, res, next){
  if(err instanceof Error){
    if(err.message === '401'){
      res.status(401);
      res.send('Unauthorized');
    }
  }
});

function defaultCb (err, res) {
  if (err) {
    res.send(JSON.stringify({error: 'internal error'}));
  } else {
    res.send(JSON.stringify({status: 'success'}));
  }
}

app.get('/getlvl', function getlvl (req, res) {
  db.levels.find(function onFind (err, rows) {
    if (err) {
      res.send(JSON.stringify({error: 'internal error'}));
    } else {
      res.send(JSON.stringify(rows));
    }
  })
});

app.get('/setlvl', function setlvl (req, res) {
  let lvl = req.query.lvl;
  let bonus = req.query.bonus;
  db.levels.update(lvl, bonus, (err) => {
    defaultCb(err, res);
  });
});

app.get('/addlvl', function addlvl (req, res) {
  let lvl = req.query.lvl;
  let bonus = req.query.bonus;
  db.levels.insert(lvl, bonus, (err) => {
    defaultCb(err, res);
  });
});

app.get('/dellvl', function addlvl (req, res) {
  db.levels.delete(req.query.lvl, (err) => {
    defaultCb(err, res);
  });
});

app.post('/settings', function save (req, res) {
  db.settings.update(req.body, (err) => {
    defaultCb(err, res);
  });
});

app.get('/settings', function get (req, res) {
  db.settings.find((err, rows) => {
    if (err) {
      res.send(JSON.stringify({error: 'internal error'}));
    } else {
      res.send(JSON.stringify(rows[0]));
    }
  });
});

app.get('/refs', function refs (req, res) {
  let offset = req.query.offset ? req.query.offset : 0;
  db.bonuses.find(offset, function onFind(err, rows) {
    if (err) {
      res.send(JSON.stringify({error: 'internal error'}));
    } else {
      res.send(JSON.stringify(rows));
    }
  });
});

app.get('/bonuses', function (req, res) {
  res.sendFile(__dirname + '/bonuses.html');
});

module.exports = app;