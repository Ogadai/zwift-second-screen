const routePredictor = require('./routePredictor');
const pollInterval = require('./pollInterval');

let i = 1;

const DELAY_MS = 4000;

class PooledRider {
    constructor(account, riderId) {
        this.account = account;
        this.riderId = riderId;

        this.lastTime = new Date();
        this.last = null;
        this.previous = null;
        this.skip = 0;

        this.promise = null;

        this.static = {};
        this.staticPromise = null;
    }

    get id() {
        return this.riderId;
    }

    status() {
        this.lastTime = new Date();
        let statusPromise;

        if (this.promise) {
            statusPromise = this.promise;
        }
        else if (this.last || this.skip > 0) {
            statusPromise = new Promise(resolve => resolve(this.last));
        } else {
            statusPromise = this.refresh();
        }

        return statusPromise;
        // return statusPromise.then(status => {
        //     if (status && this.previous && (this.previous.x !== status.x || this.previous.y !== status.y)) {
        //         const age = Math.min(new Date() - status.requestTime, 10000);
        //         const predicted = routePredictor(status.world).predict(this.previous, status, [ age + pollInterval.get() ]);
        //         if (predicted && predicted.length > 0 && predicted[0] && (predicted[0].x || predicted[0].y)) {
        //             status.next = predicted[0];
        //         }
        //     }
        //     return status;
        // });
    }

    refresh() {
        if (!this.staticPromise) {
            this.getStatic();
        }

        if (this.skip > 0) {
            this.skip--;
            return Promise.resolve(this.last);
        }

        this.promise = new Promise(resolve => {
            this.account.getWorld(1).riderStatus(this.riderId)
                .then(status => {
                    this.promise = null;
                    if (this.last && status.time === this.last.time) {
                        console.log(`Same time for ${this.riderId}`)
                        resolve(this.last);
                        return;
                    }

                    status.requestTime = new Date();
                    this.previous = this.last;

                    this.last = this.addStatic(status);
                    resolve(this.last);
                })
                .catch(ex => {
                    console.log(`Failed to get status for ${this.riderId}${errorMessage(ex)}`);
                    this.promise = null;
                    this.last = null;
                    this.skip = 5;
                    resolve(null);
                });
        });
        return this.promise;
    }

    getStatic() {
        this.staticPromise = this.account.getProfile(this.riderId).profile()
            .then(profile => {
                this.static = {
                    weight: profile.weight
                }
            })
            .catch(ex => {
                console.log(`Failed to get profile for ${this.riderId}${errorMessage(ex)}`);
            });
    }

    addStatic(status) {
        const extra = {
            world: status.world,
            wattsPerKG: this.getWattsPerKg(status.power, this.static.weight),
            roadID: status.roadID,
            rideOns: status.rideOns,
            isTurning: status.isTurning,
            isForward: status.isForward
        };
        return Object.assign({}, status, extra);
    }

    getWattsPerKg(power, weight) {
        return weight ? Math.round((10 * power) / (weight / 1000)) / 10 : undefined
    }

    get isStale() {
        return (new Date() - this.lastTime) > 10000;
    }

    delayPosition(position) {
        // DELAY_MS
        const delayTime = DELAY_MS - (new Date() - this.last.requestTime);
        if (!this.previous || delayTime < 0) return position;

        const gapTime = this.last.requestTime - this.previous.requestTime;
        const factor = delayTime / gapTime;
        const value = (prop) => {
            const last = position[prop],
                  diff = last - this.previous[prop];
            return last && diff ? last - diff * factor : last;
        }

        return Object.assign({}, position, {
          distance: value('distance'),
          time: value('time'),
          climbing: value('climbing'),
          x: value('x'),
          y: value('y'),
          altitude: value('altitude'),
        });
    }

    // projectPosition() {
    //     const gap = this.lastTime - this.last.requestTime,
    //           previous = (this.last.time - this.previous.time) * 1000;
    //     const factor = gap / previous;
    //     const value = (prop) => {
    //         const last = this.last[prop],
    //               diff = last - this.previous[prop];
    //         return last && diff ? last + diff * factor : last;
    //     }

    //     return {
    //       distance: value('distance'),
    //       time: value('time'),
    //       climbing: value('climbing'),
    //       x: value('x'),
    //       y: value('y'),
    //       altitude: value('altitude'),
    //       speed: this.last.speed,
    //       power: this.last.power,
    //       heartrate: this.last.heartrate
    //     };
    // }
}
module.exports = PooledRider;

function errorMessage(ex) {
    return (ex && ex.response && ex.response.status)
        ? `- ${ex.response.status} (${ex.response.statusText})`
        : ex.message;
}