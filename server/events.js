const NodeCache = require('node-cache')
const Store = require('./store');

const eventsCache = new NodeCache({ stdTTL: 10 * 60, checkperiod: 120, useClones: false });
const ridersCache = new NodeCache({ stdTTL: 2 * 60, checkperiod: 30, useClones: false });

const BEFORE_MINUTES = 180;
const AFTER_MINUTES = 20;

const getEventRiderStore = (event) => new Store({ ttl: 2 * 60, name: `event-${event}-rider-list`, list: true });

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

  findMatchingEvent(eventSearch) {
    return this.getEvents().then(events => {
      const eventId = parseInt(eventSearch);
      const eventMatch = eventSearch.toLowerCase();

      for(let n = events.length -1; n >= 0; n--) {
        const event = events[n];
        if ( (event.id === eventId)
          || (event.name.toLowerCase().indexOf(eventMatch) !== -1)) {
          return event;
        }
      }
      return null;
    });
  }

  findEventForSubgroup(subgroupId) {
    return this.getEvents().then(events => {
      return events.find(event =>
        event.eventSubgroups && event.eventSubgroups.find(group => group.id === subgroupId)
      );
    });
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
    getEventRiderStore(event).set(`rider-${rider.id}`, rider);
  }

  getRidersInEvent(event) {
    return getEventRiderStore(event).getAll();
  }

  downloadEvents() {
    if (!this.eventsPromise) {
      const timeNow = Date.now();
      const params = {
        eventStartsAfter: timeNow - BEFORE_MINUTES * 60 * 1000,
        eventStartsBefore: timeNow + AFTER_MINUTES * 60 * 1000
      };

      this.eventsPromise = this.account.getEvent().search(params)
        .then(events => {
          console.log(`${events.length} events`);

          eventsCache.set(this.eventsCacheId(), events);
          this.eventsPromise = null;
          return events;
        });
    }
    return this.eventsPromise;
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
