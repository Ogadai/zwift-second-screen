const NodeCache = require('node-cache')
const eventsCache = new NodeCache({ stdTTL: 10 * 60, checkPeriod: 120, useClones: false });

const BEFORE_MINUTES = 180;
const AFTER_MINUTES = 20;

class Events {
  constructor(account) {
    this.account = account;
  }

  getEvents() {
    const cached = this.getFromCache();

    if (cached) {
      return Promise.resolve(cached);
    } else {
      return this.download();
    }
  }

  getFromCache() {
    return eventsCache.get(this.cacheId());
  }

  download() {
    const timeNow = Date.now();
    const params = {
      eventStartsAfter: timeNow - BEFORE_MINUTES * 60 * 1000,
      eventStartsBefore: timeNow + AFTER_MINUTES * 60 * 1000
    };

    return this.account.getEvent().search(params)
      .then(events => {
        console.log(`${events.length} events`);

        eventsCache.set(this.cacheId(), events);
        return events;
      });
  }

  cacheId() {
    return `events`;
  }
}
module.exports = Events;
