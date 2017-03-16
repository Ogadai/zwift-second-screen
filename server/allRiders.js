const NodeCache = require('node-cache')

const ridersCache = new NodeCache({ stdTTL: 30, checkPeriod: 10, useClones: false });

class AllRiders {
  constructor(account) {
    this.account = account;
    this.promise = null;
  }

  get() {
    const cached = this.getFromCache();

    if (cached) {
      return Promise.resolve(cached);
    } else {
      return this.download();
    }
  }

  getFromCache() {
    return ridersCache.get(this.cacheId());
  }

  download() {
    if (!this.promise) {
        this.promise = this.account.getWorld(1).riders()
        .then(response => {
            const riders = response.friendsInWorld;
            ridersCache.set(this.cacheId(), riders);
            this.promise = null;

            console.log(`${riders.length} active riders in world`);
            return riders;
        });
    }
    return this.promise;
  }

  cacheId() {
    return 'all-riders';
  }

}
module.exports = AllRiders;
