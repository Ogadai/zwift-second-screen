const NodeCache = require('node-cache')
const eventsCache = new NodeCache({ stdTTL: 10 * 60, checkPeriod: 120, useClones: false });
const ridersCache = new NodeCache({ stdTTL: 2 * 60, checkPeriod: 30, useClones: false });

const BEFORE_MINUTES = 180;
const AFTER_MINUTES = 20;

class Events {
  constructor(account) {
    this.account = account;
  }

  getEvents() {
    const cached = this.eventsFromCache();

    if (cached) {
      return Promise.resolve(cached);
    } else {
      return this.downloadEvents();
    }
  }

  getRiders(subGroupId) {
    const cached = this.ridersFromCache(subGroupId);

    if (cached) {
      return Promise.resolve(cached);
    } else {
      return this.downloadRiders(subGroupId);
    }
  }

  eventsFromCache() {
    return eventsCache.get(this.eventsCacheId());
  }

  setRidingInEvent(event, rider) {
    ridersCache.set(`rider-${event}-${rider.id}`, rider);
  }

  getRidersInEvent(event) {
    const prefix =`rider-${event}-`;
    const riderKeys = ridersCache.keys()
        .filter(k => k.indexOf(prefix) === 0);

    return riderKeys.map(k => ridersCache.get(k));
  }

  downloadEvents() {
    const timeNow = Date.now();
    const params = {
      eventStartsAfter: timeNow - BEFORE_MINUTES * 60 * 1000,
      eventStartsBefore: timeNow + AFTER_MINUTES * 60 * 1000
    };

    return this.account.getEvent().search(params)
      .then(events => {
        console.log(`${events.length} events`);

        eventsCache.set(this.eventsCacheId(), events);
        return events;
      });
  }

  eventsCacheId() {
    return `events`;
  }

  ridersFromCache(subGroupId) {
    return ridersCache.get(this.ridersCacheId(subGroupId));
  }

  downloadRiders(subGroupId) {
    return this.account.getEvent().riders(subGroupId)
      .then(riders => {
        ridersCache.set(this.ridersCacheId(subGroupId), riders);
        return riders;
      });
  }

  ridersCacheId(subGroupId) {
    return `riders-${subGroupId}`;
  }
}
module.exports = Events;
