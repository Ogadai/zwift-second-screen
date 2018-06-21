const Ghost = require('./ghost')
const NodeCache = require('node-cache')

const activityCache = new NodeCache({ stdTTL: 30 * 60, checkperiod: 120, useClones: false });
const ghostsTTL = 10 * 60;
const ghostsCache = new NodeCache({ stdTTL: ghostsTTL, checkperiod: 120, useClones: false });

function forRider(account, riderId) {
  const cacheId = `ghosts-${riderId}`;
  const cached = ghostsCache.get(cacheId);
  if (cached) {
    ghostsCache.ttl(cacheId, ghostsTTL);
    return cached;
  }

  const ghosts = new Ghosts(account);
  ghostsCache.set(cacheId, ghosts);
  return ghosts;
}

class Ghosts {
  constructor(account, riderId) {
    this.account = account;
    this.ghostRiders = [];
  }

  addGhost(riderId, activityId) {
    return Promise.all([
      this.getActivity(riderId, activityId),
      this.getStaticData(riderId)
    ]).then(([activity, staticData]) => {
        this.removeGhost(activityId);
        this.ghostRiders.push(new Ghost(activity, activityId, staticData));
      });
  }

  addGhostFromActivity(riderId, worldId, activity) {
    return this.getStaticData(riderId)
      .then(staticData => {
        const ammendedActivity = Object.assign({
          firstName: staticData.firstName,
          lastName: staticData.lastName,
          worldId
        }, activity);
        this.removeGhost(activity.id);
        this.ghostRiders.push(new Ghost(ammendedActivity, activity.id, staticData));
      });
  }

  getStaticData(riderId) {
    return this.account.getProfile(riderId).profile()
        .then(profile => {
          return {
              firstName: profile.firstName,
              lastName: profile.lastName,
              weight: profile.weight
          }
        })
  }

  removeGhost(ghostId) {
    this.ghostRiders = this.ghostRiders.filter(g => g.getId() !== ghostId);
  }

  removeAll() {
    this.ghostRiders = [];
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
Ghosts.forRider = forRider;
module.exports = Ghosts;
