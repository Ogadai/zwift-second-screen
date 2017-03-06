const PooledRider = require('./pooledRider')

const MIN_INTERVAL = 5000;
const RATE_LIMIT = process.env.ZwiftRateLimit || 5
const MAX_RATE = RATE_LIMIT * 0.8;

class RiderPool {
  constructor(account) {
    this.account = account;
    
    this.riders = {};
    this.timeout = null;
  }

  riderStatus(riderId) {
    if (!this.riders[riderId]) {
        console.log(`added ${riderId}`);
        this.riders[riderId] = new PooledRider(this.account, riderId);
        this.trigger();
    }

    return this.riders[riderId].status()
  }

  trigger() {
    const count = this.list().length;
    if (!this.timeout && count > 0) {
        const delay = Math.max(1000 * count / MAX_RATE, MIN_INTERVAL);
        this.timeout = setTimeout(() => this.refreshAll(), delay);
    }
  }

  refreshAll() {
    let refreshList = [];
    this.list().forEach(rider => {
        if (rider.isStale) {
            console.log(`removed ${rider.id}`);
            delete this.riders[rider.id];
        } else {
            refreshList.push(rider);
        }
    });

    refreshNext();
    this.timeout = null;
    this.trigger();

    function refreshNext() {
        if (refreshList.length > 0) {
            const chunk = Math.max(1, Math.ceil(refreshList.length / 5));
            const riders = refreshList.splice(0, chunk);
            const promises = riders.map(r => r.refresh());
            Promise.all(promises).then(() => refreshNext());
        }
    }
  }

  list() {
      const list = [];
      for(const id in this.riders) {
          list.push(this.riders[id]);
      }
      return list;
  }
}


module.exports = RiderPool
