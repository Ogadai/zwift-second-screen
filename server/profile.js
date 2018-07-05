const NodeCache = require('node-cache')
const cache = new NodeCache({ stdTTL: 30 * 60, checkperiod: 120, useClones: false });

class Profile {
  constructor(account) {
    this.account = account;
  }

  getProfile(riderId) {
    const cached = this.profileFromCache(riderId);

    if (cached) {
      if (cached.id == riderId) {
        return Promise.resolve(cached);
      } else {
        return Promise.reject(cached);
      }
    } else {
      return this.downloadProfile(riderId);
    }
  }

  getFollowees(riderId) {
    const cached = this.followeesFromCache(riderId);

    if (cached) {
      return Promise.resolve(cached);
    } else {
      return this.downloadFollowees(riderId);
    }
  }

  profileFromCache(riderId) {
    return cache.get(this.profileCacheId(riderId));
  }

  downloadProfile(riderId) {
    return this.account.getProfile(riderId).profile()
      .then(profile => {
        cache.set(this.profileCacheId(riderId), profile);
        return profile;
      })
      .catch(err => {
        const resErr = {
          message: err.message,
          stack: err.stack,
          response: {
            status: err.response.status,
            statusText: err.response.statusText,
            data: err.response.data
          }
        };
        cache.set(this.profileCacheId(riderId), resErr, 60);
        throw resErr;
      });
  }

  profileCacheId(riderId) {
    return `profile-${riderId}`;
  }

  followeesFromCache(riderId) {
    return cache.get(this.followeesCacheId(riderId));
  }

  downloadFollowees(riderId) {
    return this.account.getProfile(riderId).followees()
      .then(followees => {
        cache.set(this.followeesCacheId(riderId), followees);
        return followees;
      });
  }

  followeesCacheId(riderId) {
    return `followees-${riderId}`;
  }
}
module.exports = Profile;
