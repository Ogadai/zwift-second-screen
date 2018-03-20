const Guid = require('guid');
const NodeCache = require('node-cache')
const ZwiftAccount = require('zwift-mobile-api');
const Session = require('./session');
const Rider = require('./rider');
const RiderPool = require('./riderPool');

const sessionTimeout = 30 * 60;
const sessionCache = new NodeCache({ stdTTL: sessionTimeout, checkperiod: 120, useClones: false });

class Login {
  getRider(cookie) {
    const session = this.getSession(cookie);
    if (session) return session.getRider();
    return null;
  }

  get canLogout() {
    return true;
  }

  get canSetWorld() {
    return true;
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
    const pool = new RiderPool(account);
    const rider = new Rider(account);

    return rider.getProfile()
      .then(profile => {
        rider.setRiderId(profile.id, id => pool.riderStatus(id));

        const cookie = Guid.raw();
        sessionCache.set(cookie, new Session(rider));
        return {
          cookie,
          id: profile.id,
          firstName: profile.firstName,
          lastName: profile.lastName,
          privacy: profile.privacy
        };
      });
  }

}

module.exports = Login;
