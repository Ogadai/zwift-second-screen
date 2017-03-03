const POLL_INTERVAL = 2500;

class Session {
  constructor(rider, pool) {
    this.rider = rider;
    this.pool = pool;
    this.interval = null;
    this.subscriptions = 0;
  }

  getRider() {
    return this.rider;
  }

  subscribe() {
    if (this.subscriptions === 0) {
      console.log(`start-polling`);
      this.interval = setInterval(() => {
        this.rider.pollPositions();
      }, POLL_INTERVAL);
      this.rider.pollPositions();
    }
    this.subscriptions++;

    let unsubscribed = false;
    return () => {
      if (!unsubscribed) {
        unsubscribed = true;
        this.subscriptions--;

        if (this.subscriptions === 0) {
          console.log(`stop-polling`);
          clearInterval(this.interval);
        }
      }
    }
  }
}
module.exports = Session;
