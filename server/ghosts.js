const EventEmitter = require('events')
const Ghost = require('./ghost')

class Ghosts extends EventEmitter {
  constructor(account, riderId) {
    super();

    this.account = account;

    this.ghostRiders = [];
    this.cached = {};
  }

  addGhost(riderId, activityId) {
    return this.getActivity(riderId, activityId)
      .then(activity => {
        this.removeGhost(activityId);
        this.ghostRiders.push(new Ghost(activity, activityId));
      });
  }

  removeGhost(ghostId) {
    this.ghostRiders = this.ghostRiders.filter(g => g.getId() !== ghostId);
  }

  getList() {
    return this.ghostRiders.map(g => g.getDetails());
  }

  getPositions() {
    return this.ghostRiders.map(g => g.getPosition());
  }

  regroup(position) {
    return this.ghostRiders.map(g => g.regroup(position));
  }

  getActivity(riderId, activityId) {
    const cached = this.getFromCache(activityId);

    if (cached) {
      return Promise.resolve(cached);
    } else {
      return this.download(riderId, activityId);
    }
  }

  getFromCache(activityId) {
    return this.cached[activityId];
  }

  download(riderId, activityId) {
    return this.account.getActivity(riderId).get(activityId)
      .then(activity => {
        activity.id = activityId;
        this.cached[activityId] = activity;
        return activity;
      });
  }
}
module.exports = Ghosts;
