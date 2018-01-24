const NodeCache = require('node-cache')
const cache = new NodeCache({ stdTTL: 30 * 60, checkPeriod: 120, useClones: false });

class Profile {
  constructor(account) {
    this.account = account;
  }

  getProfile(riderId) {
    const cached = this.profileFromCache(riderId);

    if (cached) {
      return Promise.resolve(cached);
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
