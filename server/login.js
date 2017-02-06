const ZwiftAccount = require('zwift-mobile-api');
const Rider = require('./rider');

const settings = require('../settings');

let rider = null;

class Login {

  getRider(cookie) {
    return rider;
  }

  login(username, password) {
    const account = new ZwiftAccount(username, password);
    rider = new Rider(account);

    return rider.getProfile()
      .then(profile => { cookie: '' });
  }

}

module.exports = Login;
