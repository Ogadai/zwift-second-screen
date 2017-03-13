const EventEmitter = require('events')
const Ghosts = require('./ghosts')

const MAX_RIDERS = 10;

class Rider extends EventEmitter {
  constructor(account, riderId, riderStatusFn) {
    super();

    this.account = account;
    this.riderId = riderId;
    this.ghosts = new Ghosts(account, riderId);
    this.riderStatusFn = riderStatusFn || this.fallbackRiderStatusFn
  }

  setRiderId(riderId, riderStatusFn) {
    this.riderId = riderId;
    this.riderStatusFn = riderStatusFn || this.fallbackRiderStatusFn
  }

  setWorld() {
		// not implemented
  }
  getWorld() {
		// not implemented
    return undefined
  }

  pollPositions() {
    this.getPositions()
      .then(positions => {
        this.emit('positions', positions);
      })
      .catch(err => {
        console.error(err);
      });
  }

  getGhosts() {
    return this.ghosts;
  }

  regroupGhosts() {
    return this.getPositions().then(positions => {
      if (positions.length > 0) {
        return this.getGhosts().regroup(positions[0]);
      }
			return []
    })
  }

  getProfile() {
    return this.account.getProfile(this.riderId).profile();
  }

  getRiders() {
    return this.getProfile().then(profile => {
      return this.getFriends(profile.id).then(friends => {
        return [profile].concat(friends.map(this.friendMap));
      });
		});
  }

	getFriends(riderId) {
		return this.account.getProfile(riderId).followees();
	}

  getActivities(worldId, riderId) {
    const matchWorld = parseInt(worldId);
    return this.account.getProfile(riderId).activities(0, 30)
      .then(activities => {
				return activities.filter(a => a.worldId === matchWorld);
      });
  }

  getRidingNow() {
    const cached = this.getCachedRiders();
    if (cached) {
      return Promise.resolve(cached);
    } else {
      return this.requestRidingNow().then(riders => {
        this.ridingNow = riders;
        this.ridingNowDate = new Date();
        return riders;
      });
    }
  }

  getCachedRiders() {
    if (this.ridingNow && (new Date() - this.ridingNowDate < 30000)) {
      return this.ridingNow;
    }
    return null;
  }

  requestRidingNow() {
    return this.getRiders().then(riders => riders.filter(r => r.riding));
  }

  friendMap(friend) {
    return friend.followeeProfile;
  }

  getPositions() {
		// id, firstName, lastName
    return this.getRidingNow().then(riders => {
      const promises = riders
          .slice(0, MAX_RIDERS)
          .map(r => this.riderPromise(r));

      return Promise.all(promises)
        .then(positions => this.addGhosts(positions.filter(p => p !== null)));
    });
  }

  riderPromise(rider) {
    return this.riderStatusFn(rider.id)
      .then(status => {
        if (status) {
          return {
            id: rider.id,
            firstName: rider.firstName,
            lastName: rider.lastName,
            distance: status.distance,
            speed: status.speed,
            power: status.power,
            time: status.time,
            climbing: status.climbing,
            x: status.x,
            y: status.y,
            altitude: status.altitude,
            heartrate: status.heartrate,
            wattsPerKG: status.wattsPerKG
          };
        } else {
          return null;
        }
      });
  }

  addGhosts(positions) {
    const ghostPositions = this.ghosts.getPositions();
    return positions.concat(ghostPositions);
  }

  fallbackRiderStatusFn(id) {
    return new Promise(resolve => {
      this.account.getWorld(1).riderStatus(id)
          .then(status => {
            resolve(status);
          })
          .catch(ex => {
            console.log(`Failed to get status for ${id}${errorMessage(ex)}`);
            resolve(null);
          });
    });
  }
}
module.exports = Rider;

function errorMessage(ex) {
    return (ex && ex.response && ex.response.status) ? `- ${ex.response.status} (${ex.response.statusText})` : '';
}