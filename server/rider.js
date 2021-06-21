const EventEmitter = require('events');
const Ghosts = require('./ghosts');
const AllRiders = require('./allRiders');
const Events = require('./events');
const Profile = require('./profile');
const Store = require('./store');

const userStore = new Store({ ttl: 30, name: 'all-rider-list', list: true });
const riderStore = new Store({ ttl: 10 * 60, name: 'logged-in-riders' });

const MAX_RIDERS = 40;

const GROUP_COLOURS = [
  'red',
  'green',
  'blue',
  'yellow'
];

const COURSE_TO_WORLD = {
  3: 1,
  4: 2,
  5: 3,
  6: 1,
  7: 3,
  8: 4,
  9: 5,
  10: 6,
  11: 7,
  12: 8,
  14: 10,
  15: 11,
  13: 9
}

const EVENT_PREFIX = "event:";
const ALL_PREFIX = "all:";

class Rider extends EventEmitter {
  constructor(account, riderId, riderStatusFn) {
    super();

    this.account = account;
    this.allRiders = new AllRiders(account);
    this.events = new Events(account);
    this.profile = new Profile(account);
    this.riderId = riderId;
    this.ghosts = null;
    this.riderStatusFn = riderStatusFn || this.fallbackRiderStatusFn

    this.cacheKey = `rider-${riderId}`;
    this.restorePromise = riderStore.get(this.cacheKey)
      .then(state => {
        if (state) {
          riderStore.ttl(this.cacheKey);
          this.state = state;
        } else {
          this.state = {
            worldId: undefined,
            statusWorldId: undefined,
            filter: undefined
          };
        }
      });
  }

  store() {
    return riderStore.set(this.cacheKey, this.state);
  }

  setRiderId(riderId, riderStatusFn) {
    this.riderId = riderId;
    this.riderStatusFn = riderStatusFn || this.fallbackRiderStatusFn
  }

  setWorld(worldId) {
    this.restorePromise.then(() => {
      if (this.state.worldId !== worldId) {
        this.state.worldId = worldId;
        this.store();
        this.emit('world', this.state.worldId);
      }
    });
  }

  getWorld() {
    return this.state.worldId;
  }

  setFilter(filter) {
    return this.restorePromise.then(() => {
      if (this.state.filter !== filter) {
        this.state.filter = filter;
        return this.store();
      }
    });
  }

  getFilter() {
    return this.state.filter;
  }

  getFilterDetails() {
    return this.restorePromise.then(() => {
      if (this.state.filter && this.state.filter.indexOf(EVENT_PREFIX) === 0) {
        const eventSearch = this.state.filter.substring(EVENT_PREFIX.length);
        return this.events.findMatchingEvent(eventSearch).then(event => {
          return {
            filter: this.state.filter,
            eventName: event && event.name
          };
        });
      }

      return {
        filter: this.state.filter
      };
    });
  }

  getCurrentWorld() {
    return this.state.worldId || this.state.statusWorldId;
  }

  getCurrentEventFromPositions(positions) {
    const mePosition = positions && positions.find(p => p && p.me);
    if (mePosition && mePosition.currentEventSubgroupId) {
      return this.events.findEventForSubgroup(mePosition.currentEventSubgroupId);
    }

    return Promise.resolve(null);
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
    if (!this.ghosts) {
      this.ghosts = Ghosts.forRider(this.account, this.riderId);
    }
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
    if (!this.riderId) {
      return Promise.resolve({
        anonymous: true,
        useMetric: true
      });
    } else if (this.getProfileRequest) {
      return this.getProfileRequest;
    } else {
      this.getProfileRequest = this.profile.getProfile(this.riderId)
          .then(profile => {
            if (profile) {
              userStore.set(`rider-${this.riderId}`, profile);
            }

            this.getProfileRequest = null;
            return profile;
          });
      return this.getProfileRequest;
    }
  }

  getRiders() {
    // Called to get a list of riders that we can add as ghosts
    return this.requestRidingFriends();
  }

  requestRidingFriends() {
    if (!this.riderId) {
      return Promise.resolve([]);
    }

    return this.getProfile().then(profile => {
      if (!profile) return [];

      profile.me = true;
      return this.getFriends(profile.id).then(friends => {
        return [profile].concat(friends);
      });
		});
  }

	getFriends(riderId) {
    return this.profile.getFollowees(riderId)
      .then(friendIDs => 
          Promise.all(friendIDs.map(id => this.checkOnline(id).then(isOnline => isOnline ? id : null)))
          .then(friends => friends.filter(f => !!f))
      )
      .then(friendIDs => {
        return Promise.all(friendIDs.map(id => this.profile.getProfile(id)));
      });
    // return Promise.all([
    //   this.profile.getFollowees(riderId),
    //   this.allRiders.get()
    // ]).then(([friendIDs, worldRiders]) => Promise.all(
    //   friendIDs
    //     .filter(id => worldRiders.find(rider => id === rider.playerId))
    //     .map(id => this.profile.getProfile(id))
    // ));
	}

  getActivities(worldId, riderId) {
    const matchWorld = parseInt(worldId);

    return new Promise(resolve => {
      this.account.getProfile(riderId).activities(0, 30)
        .then(activities => {
          resolve(activities.filter(a => a.worldId === matchWorld));
      }).catch(ex => {
        console.log(`Failed to get activities for ${riderId}${errorMessage(ex)}`);
        resolve(null);
      });
    });
  }

  requestRidingNow() {
    return this.state.filter
      ? this.requestRidingFiltered()
            .then(riders => this.addMeToRiders(riders))
      : this.requestRidingFriends();
  }

  requestRidingFiltered() {
    if (this.state.filter.indexOf(EVENT_PREFIX) === 0) {
      const eventSearch = this.state.filter.substring(EVENT_PREFIX.length);
      return this.requestRidingEvent(eventSearch);
    } else if (this.state.filter.indexOf(ALL_PREFIX) === 0) {
      const allSearch = this.state.filter.substring(ALL_PREFIX.length);
      return this.requestAll(allSearch);
    } else {
      return this.requestRidingFilterName();
    }
  }

  filterByCurrentlyRiding(riders) {
    return Promise.all(riders.map(rider => this.checkOnline(rider.id).then(isOnline => isOnline ? rider : null)))
        .then(responses => responses.filter(r => !!r));
  }

  addMeToRiders(riders) {
    const eventSearch = (this.state.filter.indexOf(EVENT_PREFIX) === 0)
        ? this.state.filter.substring(EVENT_PREFIX.length) : null;

    let mePromise;
    if (this.riderId && !riders.find(r => r.id == this.riderId)) {
      mePromise = this.getProfile().then(profile => {
        if (!profile) return riders;

        profile.me = true;

        if (eventSearch && isNaN(eventSearch)) {
          this.events.setRidingInEvent(eventSearch, profile);
        }

        return [profile].concat(riders);
      })
    } else {
      mePromise = Promise.resolve(riders);
    }

    if (eventSearch && isNaN(eventSearch) && riders.length === 0) {
      // Add people tracking the same event if no riders in Zwift event
      return Promise.all([
        mePromise,
        this.events.getRidersInEvent(eventSearch)
      ]).then(([riders, eventRiders]) => {
        return riders.concat(
          eventRiders
            .filter(er => er && !riders.find(r => r.id === er.id))
            .map(er => Object.assign({}, er, { me: false }))
        );
      });
    } else {
      return mePromise;
    }
  }

  requestRidingFilterName() {
    return this.allRiders.get()
      .then(worldRiders =>
        worldRiders
          .filter(r => this.filterWorldRider(r))
          .map(r => this.mapWorldRider(r))
    );
  }

  requestRidingEvent(eventSearch) {
    return this.events.findMatchingEvent(eventSearch).then(event => {
      if (event) {
        return Promise.all(
          event.eventSubgroups.map(g => this.getSubgroupRiders(g.id, g.label))
        ).then(groupedRiders => {
          const allRiders = [].concat.apply([], groupedRiders);

          const meRider = allRiders.find(r => r.id == this.riderId);
          if (meRider) {
            if (isNaN(eventSearch)) {
              this.events.setRidingInEvent(eventSearch, meRider);
            }
            allRiders.sort((a, b) =>
              (a.me || b.me) ? (a.me ? -1 : 1)
              : Math.abs(a.group - meRider.group) - Math.abs(b.group - meRider.group)
            );
          }

          return allRiders;
        });
      } else {
        // No matching event
        return [];
      }
    });
  }

  getSubgroupRiders(subGroupId, label) {
    return this.events.getRiders(subGroupId)
      .then(riders => riders.map(r => {
        return Object.assign({}, r, {
          me: r.id == this.riderId,
          group: label
        }
      )}));
  }

  requestAll(allSearch) {
    if (allSearch == 'users') {
      return userStore.getAll()
    } else if (allSearch == 'riders') {
      return this.allRiders.get().then(riders => riders.map(r => this.mapWorldRider(r)))
    }

    return Promise.resolve([]);
  }

  filterWorldRider(rider) {
    const fullName = `${rider.firstName ? rider.firstName : ''} ${rider.lastName ? rider.lastName: ''}`;
    return fullName.toLowerCase().indexOf(this.state.filter) !== -1;
  }

  mapWorldRider(rider) {
    return {
      id: rider.playerId,
      me: rider.playerId == this.riderId,
      firstName: rider.firstName,
      lastName: rider.lastName,
      male: rider.male,
      playerType: rider.playerType,
      countryCode: rider.countryISOCode
    };
  }

  friendMap(friend) {
    return {
      id: friend
    };
  }

  getPositions() {
    return this.restorePromise.then(() => {
      return new Promise(resolve => {
        // id, firstName, lastName
        this.requestRidingNow()
          .then(riders => this.filterByCurrentlyRiding(riders))
          .then(riders => {
            const promises = riders
                .slice(0, MAX_RIDERS)
                .map(r => this.riderPromise(r));

            Promise.all(promises)
              .then(positions => this.filterByWorld(positions))
              .then(positions => this.addGhosts(positions.filter(p => p !== null)))
              .then(positions => resolve(positions));
          }).catch(ex => {
            console.log(`Failed to get positions for ${this.riderId}${errorMessage(ex)}`);
            resolve(null);
          });
      });
    });
  }

  checkOnline(id) {
    return this.riderStatusFn(id).then(status => !!status);
  }

  riderPromise(rider) {
    return this.riderStatusFn(rider.id)
      .then(status => {
        if (status) {
          const course = ((status.aux2 & 0xff0000) >> 16);
          const world = course in COURSE_TO_WORLD ? COURSE_TO_WORLD[course] : course;  
          
          return Object.assign({
            id: rider.id,
            me: rider.me,
            firstName: rider.firstName,
            lastName: rider.lastName,
            weight: rider.weight,
            world,
            colour: this.colourFromGroup(rider.group),
          }, status, {
            y: status.z,
            z: status.y
          });
          // return {
          //   id: rider.id,
          //   me: rider.me,
          //   firstName: rider.firstName,
          //   lastName: rider.lastName,
          //   weight: rider.weight,
          //   colour: this.colourFromGroup(rider.group),
          //   distanceCovered: status.distanceCovered,
          //   speedInMillimetersPerHour: status.speedInMillimetersPerHour,
          //   powerOutput: status.powerOutput,
          //   rideDurationInSeconds: status.rideDurationInSeconds,
          //   yaw: status.yaw,
          //   x: status.x,
          //   y: status.y,
          //   z: status.z,
          //   heartRateInBpm: status.heartRateInBpm,
          //   wattsPerKG: status.wattsPerKG,

          //   world: status.world,

            // roadID: status.roadID,
            // rideOns: status.rideOns,
            // isTurning: status.isTurning,
            // isForward: status.isForward,
            // roadDirection: status.roadDirection,
            // turnSignal: status.turnSignal,
            // powerup: status.powerup,
            // hasFeatherBoost: status.hasFeatherBoost,
            // hasDraftBoost: status.hasDraftBoost,
            // hasAeroBoost: status.hasAeroBoost,
            // sport: status.sport,
            // male: rider.male,
            // playerType: rider.playerType,
            // contryAlpha3: rider.countryAlpha3,
            // countryCode: rider.countryCode,
            // requestTime: status.requestTime
          // };
        } else {
          return null;
        }
      });
  }

  colourFromGroup(group) {
    return group ? GROUP_COLOURS[group-1] : undefined;
  }

  filterByWorld(positions) {
    const worldId = this.state.worldId || this.getWorldFromPositions(positions);
    if (worldId) {
      return positions.filter(p => p && (!p.world || p.world === worldId))
    } else {
      return positions;
    }
  }

  getWorldFromPositions(positions) {
    const mePosition = positions.find(p => p && p.me);
    const statusWorldId = mePosition ? mePosition.world : undefined;

    if (this.state.statusWorldId !== statusWorldId) {
      this.state.statusWorldId = statusWorldId;
      this.store();
    }
    return this.state.statusWorldId;
  }

  addGhosts(positions) {
    const ghostPositions = this.getGhosts().getPositions();
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
Rider.userCount = () => {
  return userStore.lastCount;
}
Rider.clearUsers = () => {
  userStore.clear();
}
Rider.clearRiders = () => {
  riderStore.clear();
}
module.exports = Rider;

function errorMessage(ex) {
  return (ex && ex.response && ex.response.status)
      ? `- ${ex.response.status} (${ex.response.statusText})`
      : ` - ${ex.message}`;
}