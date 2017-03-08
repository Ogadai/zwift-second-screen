let i = 1;
class PooledRider {
    constructor(account, riderId) {
        this.account = account;
        this.riderId = riderId;

        this.lastTime = new Date();
        this.last = null;
        this.previous = null;

        this.promise = null;
    }

    get id() {
        return this.riderId;
    }

    status() {
        this.lastTime = new Date();

        if (this.promise) {
            return this.promise;
        }
        else if (this.last) {
            return new Promise(resolve => resolve(this.last));
        }
        return this.refresh();
    }

    refresh() {
        this.promise = new Promise(resolve => {
            this.account.getWorld(1).riderStatus(this.riderId)
                .then(status => {
                    this.promise = null;
                    if (this.last && status.time === this.last.time) {
                        console.log('Same time for ${this.riderId}')
                        resolve(this.last);
                        return;
                    }

                    status.requestTime = new Date();
                    this.previous = this.last;
                    this.last = status;

                    resolve(status);
                })
                .catch(ex => {
                    const message = (ex && ex.response && ex.response.status) ? `- ${ex.response.status} (${ex.response.statusText})` : '';
                    console.log(`Failed to get status for ${this.riderId}${message}`);
                    this.promise = null;
                    this.last = null;
                    resolve(null);
                });
        });
        return this.promise;
    }

    get isStale() {
        return (new Date() - this.lastTime) > 10000;
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
