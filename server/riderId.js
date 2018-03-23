const Guid = require('guid');
const NodeCache = require('node-cache')
const ZwiftAccount = require('zwift-mobile-api');
const Rider = require('./rider');
const RiderPool = require('./riderPool');
const Events = require('./events');

const COOKIE_PREFIX = 'rider-';
const ANON_PREFIX = 'anon-';
const sessionTimeout = 30 * 60;
const sessionCache = new NodeCache({ stdTTL: sessionTimeout, checkperiod: 120, useClones: false });

class RiderId {
  constructor(username, password) {
    this.account = new ZwiftAccount(username, password);
    this.riderPool = new RiderPool(this.account);
    this.events = new Events(this.account);
  }

  getRider(cookie, event) {
    const riderId = this.getRiderIdFromCookie(cookie);
    if (riderId) {
      if (isNaN(riderId)) {
        return null;
      }
      return this.getOrCreateRider(riderId, event);
    }
    return this.getAnonymous(cookie);
  }

  get canLogout() {
    return true;
  }

  get canSetWorld() {
    return true;
  }

  get canFilterRiders() {
    return true;
  }

  get count() {
    return Rider.userCount();
  }

  getEvents() {
    return this.events.getEvents();
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

  loginAnonymous() {
    const cookie = Guid.raw();

    const newRider = new Rider(this.account, 0, id => this.riderStatusFn(id));
    sessionCache.set(`${ANON_PREFIX}${cookie}`, newRider);

    return {
      cookie
    };
  }

  getAnonymous(cookie) {
    const key = `${ANON_PREFIX}${cookie}`;
    const cachedRider = sessionCache.get(key);
    if (cachedRider) {
      sessionCache.ttl(key, sessionTimeout);
      return cachedRider;
    }
    return cachedRider;
  }

  getOrCreateRider(riderId, event) {
    const cachedRider = sessionCache.get(riderId);
    if (cachedRider) {
      sessionCache.ttl(riderId, sessionTimeout);
      return cachedRider;
    }

    const newRider = new Rider(this.account, riderId, id => this.riderStatusFn(id));
    if (event) {
      newRider.filter = `event:${event}`;
    }

//    sessionCache.set(riderId, newRider);
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
