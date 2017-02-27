const EventEmitter = require('events')
const Ghost = require('./ghost')
const NodeCache = require('node-cache')

const activityCache = new NodeCache({ stdTTL: 30 * 60, checkPeriod: 120, useClones: false });

class Ghosts extends EventEmitter {
  constructor(account, riderId) {
    super();

    this.account = account;
    this.ghostRiders = [];
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
    // Remove finished ghosts
    this.ghostRiders = this.ghostRiders.filter(g => !g.isFinished());
    
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
    return activityCache.get(this.cacheId(activityId));
  }

  download(riderId, activityId) {
    return this.account.getActivity(riderId).get(activityId)
      .then(activity => {
        activity.id = activityId;
        activityCache.set(this.cacheId(activityId), activity);
        return activity;
      });
  }

  cacheId(activityId) {
    return `activity-${activityId}`;
  }
}
module.exports = Ghosts;
