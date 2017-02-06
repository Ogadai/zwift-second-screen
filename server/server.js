const express = require('express');
const bodyParser = require('body-parser');
const app = express();
var path = require('path');
const ZwiftAccount = require('zwift-mobile-api');
const settings = require('../settings');
const Rider = require('./rider');
const Map = require('./map');

const account = new ZwiftAccount(settings.username, settings.password);
const rider = new Rider(account, settings.player);
const map = new Map();

app.use(bodyParser.json());

app.get('/followers/', function (req, res) {
    var playerId = req.query.player || settings.player;
    account.getProfile(playerId).followers().then(function (data) {
        res.send(asHtml(data))
    });
})

app.get('/followees/', function (req, res) {
    var playerId = req.query.player || settings.player;
    account.getProfile(playerId).followees().then(function (data) {
        res.send(asHtml(data))
    });
})

app.get('/riders/', function (req, res) {
  var worldId = req.query.world || 1;
  account.getWorld(worldId).riders().then(respondJson(res));
})

app.get('/status/', function (req, res) {
  var worldId = req.query.world || 1;
  var playerId = req.query.player || settings.player;
  account.getWorld(worldId).riderStatus(playerId).then(respondJson(res));
})

app.get('/json/', function (req, res) {
    var path = req.query.path;
    console.log(`Request: ${path}`);
    account.getRequest().json(path)
        .then(function (data) {
            res.send(asHtml(data))
        })
        .catch(function (err) {
            console.log(err.response);
            res.status(err.response.status).send(`${err.response.status} - ${err.response.statusText}`);
        });
})

app.get('/profile', function (req, res) {
  rider.getProfile().then(respondJson(res));
})

app.get('/friends', function (req, res) {
  rider.getRiders().then(respondJson(res));
})

app.get('/positions', function (req, res) {
  rider.getPositions().then(respondJson(res));
})

app.get('/map.svg', function (req, res) {
  map.getSvg().then(data => sendImg(res, data, 'image/svg+xml'));
})

app.get('/mapSettings', function (req, res) {
  map.getSettings().then(respondJson(res));
})

console.log(`static: ${__dirname}/../public`)
app.use(express.static(`${__dirname}/../public`))

app.use(function (req, res, next) {
  // respond with html page
  if (req.accepts('html')) {
    res.sendFile(path.resolve(`${__dirname}/../public/index.html`));
    return;
  }

  res.status(404);

  // respond with json
  if (req.accepts('json')) {
    res.send({ error: 'Not found' });
    return;
  }
  // default to plain-text. send()
  res.type('txt').send('Not found');
});

app.listen(settings.port, function () {
  console.log(`Listening on port ${settings.port}!`)
})

function respondJson(res) {
  return function (data) {
    sendJson(res, data);
  }
}

function sendJson(res, data) {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8888/');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.send(data);
}

function sendImg(res, data, contentType) {
  res.setHeader('Accept-Ranges', 'bytes');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', contentType);
  res.send(data);
}

function asHtml(data) {
  return '<html><body><pre><code>' + JSON.stringify(data, null, 4) + '</code></pre></body></html>'
}
