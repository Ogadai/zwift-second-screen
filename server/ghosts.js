const EventEmitter = require('events')
const Ghost = require('./ghost')

class Ghosts extends EventEmitter {
  constructor(account, riderId) {
    super();

    this.account = account;
    this.riderId = riderId;

    this.ghostRiders = [];
    this.cached = {};
  }

  setRiderId(riderId) {
    this.riderId = riderId;
  }

  addGhost(activityId) {
    this.getActivity(activityId)
      .then(activity => {
        this.ghostRiders.push(new Ghost(activity));
      });
  }

  getPositions() {
    return this.ghostRiders.map(g => g.getPosition());
  }

  getActivity(activityId) {
    const cached = this.getFromCache(activityId);

    if (cached) {
      return Promise.resolve(cached);
    } else {
      return this.download(activityId);
    }
  }

  getFromCache(activityId) {
    return this.cached[activityId];
  }

  download(activityId) {
    return this.account.getActivity(this.riderId).get(activityId)
      .then(activity => {
        this.cached[activityId] = activity;
        return activity;
      });
  }
}
module.exports = Ghosts;
