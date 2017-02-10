const EventEmitter = require('events')

class Rider extends EventEmitter {
  constructor(account, riderId) {
    super();

    this.account = account;
    this.riderId = riderId;
  }

  setWorld() {
		// not implemented
  }
  getWorld() {
		// not implemented
    return undefined
  }

  pollPositions() {
    this.getPositions().then(positions => {
      this.emit('positions', positions);
    });
  }

  getProfile() {
    return this.account.getProfile(this.riderId).profile();
  }

  getFriends(riderId) {
    return this.account.getProfile(riderId).followees();
  }

  getRiders() {
    const cached = this.getCachedRiders();
    if (cached) {
      return Promise.resolve(cached);
    } else {
      return this.requestRiders().then(riders => {
        this.riders = riders;
        this.ridersDate = new Date();
        return riders;
      });
    }
  }

  getCachedRiders() {
    if (this.riders && (new Date() - this.ridersDate < 30000)) {
      return this.riders;
    }
    return null;
  }

  requestRiders() {
    return this.getProfile().then(profile =>
      this.getFriends(profile.id).then(friends => {
        const ridingFriends = friends
          .filter(this.friendRidingFilter)
          .map(this.friendMap);

        if (profile.riding) {
          return [profile].concat(ridingFriends);
        } else {
          return ridingFriends;
        }
      })
    );
  }

  friendRidingFilter(friend) {
    return friend.followeeProfile && friend.followeeProfile.riding;
  }

  friendMap(friend) {
    return friend.followeeProfile;
  }

  getPositions() {
		// id, firstName, lastName
    return this.getRiders().then(riders => {
      const promises = riders.map(r => this.riderPromise(r));

      return Promise.all(promises);
    });
  }

  riderPromise(rider) {
    return this.account.getWorld(1).riderStatus(rider.id)
      .then(status => {
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
          y: status.y
        };
      });
  }
}
module.exports = Rider;
