const ZwiftAccount = require('zwift-mobile-api');
const Rider = require('./rider');

const COOKIE_PREFIX = 'rider-';

class RiderId {
  constructor(username, password) {
    this.account = new ZwiftAccount(username, password);
  }

  getRider(cookie) {
    const riderId = this.getRiderIdFromCookie(cookie);
    if (riderId) {
      return new Rider(this.account, riderId);
    }
    return null;
  }

  loginWithId(riderId) {
    if (!riderId || riderId.length == 0) {
      return Promise.reject({ response: { status: 401, statusText: 'Missing rider id' }});
    }

    const rider = new Rider(this.account, riderId);
    return rider.getProfile()
      .then(profile => {
        const cookie = this.createCookieFromRiderId(riderId);
        return { cookie }
      });
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

}

module.exports = RiderId;
