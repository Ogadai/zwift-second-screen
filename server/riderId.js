const NodeCache = require('node-cache')
const ZwiftAccount = require('zwift-mobile-api');
const Rider = require('./rider');
const RiderPool = require('./riderPool');
const RiderRealList = require('./riderRealLife');

const COOKIE_PREFIX = 'rider-';
const sessionTimeout = 30 * 60;
const sessionCache = new NodeCache({ stdTTL: sessionTimeout, checkPeriod: 120, useClones: false });

class RiderId {
  constructor(username, password) {
    this.account = new ZwiftAccount(username, password);
    this.riderPool = new RiderPool(this.account);
    this.riderRealLife = new RiderRealList();
  }

  getRider(cookie) {
    const riderId = this.getRiderIdFromCookie(cookie);
    if (riderId) {
      return this.getOrCreateRider(riderId);
    }
    return null;
  }

  setRealLifePosition(riderId, position) {
    this.riderRealLife.setPosition(riderId, position);
  }

  get canLogout() {
    return true;
  }

  get canSetWorld() {
    return true;
  }

  loginWithId(riderId) {
    if (!riderId || riderId.length == 0) {
      return Promise.reject({ response: { status: 401, statusText: 'Missing rider id' }});
    }

    const rider = this.getOrCreateRider(riderId);
    return rider.getProfile()
      .then(profile => {
        const cookie = this.createCookieFromRiderId(riderId);
        return {
          cookie,
          id: profile.id,
          firstName: profile.firstName,
          lastName: profile.lastName,
          privacy: profile.privacy
        };
      });
  }

  getOrCreateRider(riderId) {
    const cachedRider = sessionCache.get(riderId);
    if (cachedRider) {
      sessionCache.ttl(riderId, sessionTimeout);
      return cachedRider;
    }

    const newRider = new Rider(this.account, riderId, id => this.riderStatusFn(id));
    newRider.setRiderRealLife(this.riderRealLife);

    sessionCache.set(riderId, newRider);
    return newRider;
  }

  getRiderIdFromCookie(cookie) {
    if (cookie && cookie.substring(0, COOKIE_PREFIX.length) === COOKIE_PREFIX) {
      return cookie.substring(COOKIE_PREFIX.length);
    }
    return null;
  }

  createCookieFromRiderId(riderId) {
    return `${COOKIE_PREFIX}${riderId}`;
  }

  riderStatusFn(riderId) {
    return this.riderPool.riderStatus(riderId);
  }
}

module.exports = RiderId;
