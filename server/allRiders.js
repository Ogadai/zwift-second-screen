
let promise = null;
let completedPromise = null;
let checkTime = null;

class AllRiders {
  constructor(account, userCountFn) {
    this.account = account;
    this.userCountFn = userCountFn;
  }

  get() {
    if (!checkTime || (new Date() - checkTime > 30000)) {
      checkTime = new Date();
      promise = this.download().then(result => {
        completedPromise = promise;
        return result;
      });
    }

    return completedPromise ? completedPromise : promise;
  }

  download() {
    return this.account.getWorld(1).riders()
        .then(response => {
            console.log(`${response.friendsInWorld.length} active riders in world, ${this.userCountFn ? this.userCountFn() : 0} users`);
            return response.friendsInWorld;
        });
  }
}
module.exports = AllRiders;
