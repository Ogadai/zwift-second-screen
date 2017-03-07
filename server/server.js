const express = require('express');
const expressWs = require('express-ws');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');

const Map = require('./map');
const insertSiteSettings = require('./siteSettings');

class Server {
  constructor(riderProvider, settings) {
    this.riderProvider = riderProvider;
    this.hostData = settings ? settings.hostData : null;
    this.map = new Map(settings ? settings.worlds : null);
    this.siteSettings = settings ? settings.site : null;

    this.initialise();
  }

  initialise() {
    this.app = express();
    if (this.riderProvider.login) {
      expressWs(this.app);
    }

    this.app.use(bodyParser.json())
    this.app.use(cookieParser())

    this.app.get('/logintype', (req, res) => {
      const type = this.riderProvider.login ? 'user' : 'id'
      const canLogout = this.riderProvider.canLogout;
      sendJson(res, { type, canLogout });
    })

		// Enable CORS for post login
    this.app.options('/login', respondCORS)
    if (this.riderProvider.login) {
      this.app.post('/login', (req, res) => {
        const { username, password } = req.body
        console.log(`login: ${username}`)
        this.processLogin(res, this.riderProvider.login(username, password))
      })
    } else {
      this.app.post('/login', (req, res) => {
        const { id } = req.body
        console.log(`login: ${id}`)
        this.processLogin(res, this.riderProvider.loginWithId(id))
      })

      this.app.get('/login/:id', (req, res) => {
        const { id } = req.params
        console.log(`login: ${id}`)
        this.processLogin(res, this.riderProvider.loginWithId(id), true)
      })
    }

    this.app.get('/profile', this.processRider(rider => rider.getProfile()))
    this.app.get('/positions', this.processRider(rider => rider.getPositions()))
    this.app.get('/riders', this.processRider(rider => rider.getRiders ? rider.getRiders() : Promise.resolve([])))

    this.app.get('/world', this.processRider(rider => Promise.resolve({ worldId: rider.getWorld() })))

    this.app.get('/activities/:playerId', this.processRider((rider, req) => {
      const targetWorldId = rider.getWorld()
      const { playerId } = req.params;
      if (targetWorldId) {
        return rider.getActivities(targetWorldId, playerId)
      } else {
        return this.map.getSettings().then(({ worldId }) => rider.getActivities(worldId, playerId))
      }
    }))

    this.app.get('/rider/:riderId/activity/:activityId', this.processRider((rider, req) => rider.getGhosts().getActivity(req.params.riderId, req.params.activityId)))

    this.app.get('/ghosts', this.processRider((rider, req) => Promise.resolve(rider.getGhosts ? rider.getGhosts().getList() : null)))
    this.app.options('/ghosts', respondCORS)
    this.app.put('/ghosts', this.processRider((rider, req) => rider.getGhosts().addGhost(parseInt(req.body.riderId), parseInt(req.body.activityId))))
    this.app.options('/ghosts/:ghostId', respondCORS)
    this.app.delete('/ghosts/:ghostId', this.processRider((rider, req) => Promise.resolve(rider.getGhosts().removeGhost(parseInt(req.params.ghostId)))))

    this.app.options('/ghosts/post', respondCORS)
    this.app.post('/ghosts/regroup', this.processRider((rider, req) => Promise.resolve(rider.regroupGhosts())))

    if (this.riderProvider.login) {
      this.app.ws('/listen', (ws, req) => {
        const cookie = req.cookies.zssToken;
        const rider = this.riderProvider.getRider(cookie);

        if (rider) {
          const sendPositions = positions => send('positions', positions);
          const sendWorld = worldId => send('world', { worldId });

          let unsubscribeRider;

          const unsubscribe = () => {
            rider.removeListener('positions', sendPositions);
            rider.removeListener('world', sendWorld);

            if (unsubscribeRider) unsubscribeRider();
          }
          ws.on('close', unsubscribe);

          if (this.riderProvider.subscribe) {
            unsubscribeRider = this.riderProvider.subscribe(cookie);
          }

          const send = (name, data) => {
            try {
              ws.send(JSON.stringify({ name, data }));
            } catch (ex) {
              unsubscribe();
              console.error(ex);
              ws.close();
            }
          }

          const world = rider.getWorld();
          if (world) sendWorld(world);

          rider
            .on('positions', sendPositions)
            .on('world', sendWorld)
        }
      });
    }

    this.app.get('/map.svg', (req, res) => {
      const worldId = req.query.world || undefined;
      this.map.getSvg(worldId).then(data => sendImg(res, data, 'image/svg+xml'));
    })

    this.app.get('/mapSettings', (req, res) => {
      const worldId = req.query.world || undefined;
      const overlay = req.query.overlay === 'true';
      this.map.getSettings(worldId, overlay).then(respondJson(res));
    })

    this.app.get('/host', (req, res) => {
      if (this.hostData) {
        this.hostData.getHostInfo().then(respondJson(res));
      } else {
        sendJson(res, {});
      }
    })

    const indexRoute = (req, res) => {
      if (req.accepts('html')) {
				// respond with html index page
        const htmlPath = path.resolve(`${__dirname}/../public/index.html`);
        if (this.siteSettings) {
          res.send(insertSiteSettings(htmlPath, this.siteSettings));
        } else {
          res.sendFile(htmlPath);
        }
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
    };
    
    this.app.get('/', indexRoute)
		// Static hosting for web client
    this.app.use(express.static(`${__dirname}/../public`))
		// Handle 404s (React app routing)
    this.app.use(indexRoute);
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

  processLogin(res, promise, redirect = false) {
		promise
      .then(result => {
        console.log('login successful')

        const expires = new Date()
        expires.setFullYear(expires.getFullYear() + 1);
        res.cookie('zssToken', result.cookie, { path: '/', httpOnly: true, expires });

        if (redirect)
          res.redirect('/')
        else
          sendJson(res, { message: 'ok' })
      })
      .catch(err => {
        console.log('login failed - ', err)
        const { status, statusText } = err.response;
        res.status(status);

        if (redirect)
          res.redirect('/login')
        else
          sendJson(res, { status, statusText });
      })
  }

	processRider(callbackFn) {
    return (req, res) => {
		  const cookie = req.cookies.zssToken;
      const rider = this.riderProvider.getRider(cookie);
			if (rider) {
        callbackFn(rider, req)
          .then(respondJson(res))
          .catch(err => {
						console.log(err)
            if (err.response) {
              res.status(err.response.status).send(`${err.response.status} - ${err.response.statusText}`);
            } else {
              res.status(500).send(JSON.stringify(err));
            }
          });
			} else {
				res.status(401);
				sendJson(res, { status: 401, statusText: 'Unauthorised' });
			}
		}
	}

}
module.exports = Server;

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
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.send(data);
}

function sendImg(res, data, contentType) {
  res.setHeader('Accept-Ranges', 'bytes');
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8888');
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Content-Type', contentType);
  res.send(data);
}
