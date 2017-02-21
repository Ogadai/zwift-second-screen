const Guid = require('guid');
const ZwiftAccount = require('zwift-mobile-api');
const Session = require('./session');
const Rider = require('./rider');

class Login {
  constructor() {
    this.sessions = {};
  }

  getRider(cookie) {
    const session = this.sessions[cookie];
    if (session) return session.getRider();
    return null;
  }

  subscribe(cookie) {
    const session = this.sessions[cookie];
    if (session) return session.subscribe();
  }

  login(username, password) {
    const account = new ZwiftAccount(username, password);
    const rider = new Rider(account);

    const cookie = Guid.raw();
    
    return rider.getProfile()
      .then(profile => {
        rider.setRiderId(profile.id);
        this.sessions[cookie] = new Session(rider);
        return { cookie };
      });
  }

}

module.exports = Login;
