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
        this.promise = this.account.getWorld(1).riderStatus(this.riderId)
            .then(status => {
                this.promise = null;
                if (this.last && status.time === this.last.time) {
                    return this.last;
                }

                status.requestTime = new Date();
                if (this.last && this.last.requestTime < status.requestTime) {
                    this.previous = this.last;
                }
                this.last = status;

                return status;
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
