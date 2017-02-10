const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const Map = require('./map');

class Server {
  constructor(riderProvider, hostData) {
    this.app = express();

    this.map = new Map();
    this.riderProvider = riderProvider;
    this.hostData = hostData;

    this.initialise();
  }

  initialise() {
    this.app.use(bodyParser.json());

		// Enable CORS for post login
    this.app.options('/login', respondCORS)
    this.app.post('/login', (req, res) => {
      const { username, password } = req.body;
      console.log(`login: ${username}`)
      this.riderProvider.login(username, password)
        .then(result => {
          console.log('login successful')
          sendJson(res, { message: 'ok' })
        })
        .catch(err => {
          console.log('login failed - ', err)
          const { status, statusText } = err.response;
          res.status(status);
          sendJson(res, { status, statusText });
        })
    })

    this.app.get('/profile', this.processRider(rider => rider.getProfile()))
    this.app.get('/positions', this.processRider(rider => rider.getPositions()))
    this.app.get('/world', this.processRider(rider => Promise.resolve({ worldId: rider.getWorld() })))

    this.app.get('/map.svg', (req, res) => {
      const worldId = req.query.world || undefined;
      this.map.getSvg(worldId).then(data => sendImg(res, data, 'image/svg+xml'));
    })

    this.app.get('/mapSettings', (req, res) => {
      const worldId = req.query.world || undefined;
      this.map.getSettings(worldId).then(respondJson(res));
    })

    this.app.get('/host', (req, res) => {
      if (this.hostData) {
        this.hostData.getHostInfo().then(respondJson(res));
      } else {
        sendJson(res, {});
      }
    })

		// Static hosting for web client
    this.app.use(express.static(`${__dirname}/../public`))
		// Handle 404s (React app routing)
    this.app.use((req, res) => {
      if (req.accepts('html')) {
				// respond with html index page
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
  }

  start(port) {
    this.port = port;
    this.server = this.app.listen(port, () => {
      console.log(`Listening on port ${port}`);
    })
  }

  stop() {
    if (this.server) {
      this.server.close();
      console.log(`Stopped listening on port ${this.port}`);
      this.server = null;
    }
  }

	processRider(callbackFn) {
		return (req, res) => {
      const rider = this.riderProvider.getRider('');
			if (rider) {
				callbackFn(rider, req).then(respondJson(res));
			} else {
				res.status(401);
				sendJson(res, { status: 401, statusText: 'Unauthorised' });
			}
		}
	}

}
module.exports = Server;



//app.get('/followers/', function (req, res) {
//    var playerId = req.query.player || settings.player;
//    account.getProfile(playerId).followers().then(function (data) {
//        res.send(asHtml(data))
//    });
//})

//app.get('/followees/', function (req, res) {
//    var playerId = req.query.player || settings.player;
//    account.getProfile(playerId).followees().then(function (data) {
//        res.send(asHtml(data))
//    });
//})

//app.get('/riders/', function (req, res) {
//  var worldId = req.query.world || 1;
//  account.getWorld(worldId).riders().then(respondJson(res));
//})

//app.get('/status/', function (req, res) {
//  var worldId = req.query.world || 1;
//  var playerId = req.query.player || settings.player;
//  account.getWorld(worldId).riderStatus(playerId).then(respondJson(res));
//})

//app.get('/json/', function (req, res) {
//    var path = req.query.path;
//    console.log(`Request: ${path}`);
//    account.getRequest().json(path)
//        .then(function (data) {
//            res.send(asHtml(data))
//        })
//        .catch(function (err) {
//            console.log(err.response);
//            res.status(err.response.status).send(`${err.response.status} - ${err.response.statusText}`);
//        });
//})

//function asHtml(data) {
//  return '<html><body><pre><code>' + JSON.stringify(data, null, 4) + '</code></pre></body></html>'
//}


function respondJson(res) {
  return function (data) {
    sendJson(res, data);
  }
}

function respondCORS(req, res) {
  sendJson(res, {});
}

function sendJson(res, data) {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8888');
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
