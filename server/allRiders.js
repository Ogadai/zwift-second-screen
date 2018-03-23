const KeepFreshRequest = require('./keepFreshRequest');
let keepFreshRequest = null;

function download(account) {
  return account.getWorld(1).riders()
      .then(response => {
        console.log(`${response.friendsInWorld.length} riders in world`);
          return response.friendsInWorld;
      });
}

class AllRiders {
  constructor(account) {
    this.account = account;
    if (!keepFreshRequest) {
      keepFreshRequest = new KeepFreshRequest(() => download(account));
    }
  }

  get() {
    return keepFreshRequest.get();
  }
}
module.exports = AllRiders;
