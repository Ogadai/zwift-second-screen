const ZwiftAccount = require('zwift-mobile-api');
const Rider = require('./rider');

const settings = require('../settings');

let rider = null;

class Login {
  constructor() {
    this.interval = null;
    this.subscriptions = 0;
  }

  getRider(cookie) {
    return rider;
  }

  subscribe(cookie) {
    if (this.subscriptions === 0) {
      this.interval = setInterval(() => {
        if (rider) {
          rider.pollPositions();
        }
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

  login(username, password) {
    const account = new ZwiftAccount(username, password);
    rider = new Rider(account);

    return rider.getProfile()
      .then(profile => { cookie: '' });
  }

}

module.exports = Login;
