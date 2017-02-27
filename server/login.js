const Guid = require('guid');
const NodeCache = require('node-cache')
const ZwiftAccount = require('zwift-mobile-api');
const Session = require('./session');
const Rider = require('./rider');

const sessionTimeout = 30 * 60;
const sessionCache = new NodeCache({ stdTTL: sessionTimeout, checkPeriod: 120, useClones: false });

class Login {
  getRider(cookie) {
    const session = this.getSession(cookie);
    if (session) return session.getRider();
    return null;
  }

  subscribe(cookie) {
    const session = this.getSession(cookie);
    if (session) return session.subscribe();
  }

  getSession(cookie) {
    const session = cookie ? sessionCache.get(cookie) : null;
    if (session) {
      sessionCache.ttl(cookie, sessionTimeout);
    }
    return session;
  }

  login(username, password) {
    const account = new ZwiftAccount(username, password);
    const rider = new Rider(account);

    return rider.getProfile()
      .then(profile => {
        rider.setRiderId(profile.id);

        const cookie = Guid.raw();
        sessionCache.set(cookie, new Session(rider));
        return { cookie };
      });
  }

}

module.exports = Login;
