class Session {
  constructor(rider) {
    this.rider = rider;
    this.interval = null;
    this.subscriptions = 0;
  }

  getRider() {
    return this.rider;
  }

  subscribe() {
    if (this.subscriptions === 0) {
      this.interval = setInterval(() => {
        this.rider.pollPositions();
      }, 3000);
    }
    this.subscriptions++;

    return () => {
      this.subscriptions--;
      if (this.subscriptions === 0) {
        clearInterval(this.interval);
      }
    }
  }
}
module.exports = Session;
