// const routePredictor = require('./routePredictor');
// const pollInterval = require('./pollInterval');

// let i = 1;

// const DELAY_MS = 4000;

class PooledRider {
    constructor(account, riderId) {
        this.account = account;
        this.riderId = riderId;

        this.lastTime = new Date();
        this.last = null;
        this.previous = null;
        this.skip = 0;

        this.promise = null;

        this.refresh();
    }

    get id() {
        return this.riderId;
    }

    status() {
        // TODO: Get current status from cache instead of property
        this.lastTime = new Date();
        let statusPromise;

        if (this.last || this.skip > 0) {
            statusPromise = new Promise(resolve => resolve(this.last));
        } else {
            statusPromise = Promise.resolve(null);
        }

        return statusPromise;
    }

    refresh() {
        // TODO: Check Cache to see if it is really due for refresh
        // TODO: If so, add to queue for status lookup
        // TODO: Queue processors ensure only one thread picks task
        // TODO: Immediately resolve with current status or null

        if (this.skip > 0) {
            this.skip--;
            return Promise.resolve(this.last);
        }

        this.promise = new Promise(resolve => {
            this.account.getWorld(1).riderStatus(this.riderId)
                .then(status => {
                    this.promise = null;
                    if (this.last && status.rideDurationInSeconds === this.last.rideDurationInSeconds) {
                        console.log(`Same time for ${this.riderId}`)
                        resolve(this.last);
                        return;
                    }

                    status.requestTime = new Date();
                    this.previous = this.last;

                    this.last = status;
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

    get isStale() {
        return (new Date() - this.lastTime) > 10000;
    }

    // delayPosition(position) {
    //     // DELAY_MS
    //     const delayTime = DELAY_MS - (new Date() - this.last.requestTime);
    //     if (!this.previous || delayTime < 0) return position;

    //     const gapTime = this.last.requestTime - this.previous.requestTime;
    //     const factor = delayTime / gapTime;
    //     const value = (prop) => {
    //         const last = position[prop],
    //               diff = last - this.previous[prop];
    //         return last && diff ? last - diff * factor : last;
    //     }

    //     return Object.assign({}, position, {
    //       distance: value('distance'),
    //       time: value('time'),
    //       climbing: value('climbing'),
    //       x: value('x'),
    //       y: value('y'),
    //       altitude: value('altitude'),
    //     });
    // }
}
module.exports = PooledRider;

function errorMessage(ex) {
    return (ex && ex.response && ex.response.status)
        ? `- ${ex.response.status} (${ex.response.statusText})`
        : ex.message;
}