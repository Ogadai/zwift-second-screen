class KeepFreshRequest {
  constructor(callbackFn, timeMS = 30000, preloadMS = 20000) {
    this.callbackFn = callbackFn;
    this.timeMS = timeMS;
    this.preloadMS = preloadMS;

    this.lastTime = null;
    this.lastResults = null;
    this.promise = null;
  }

  get() {
    const now = new Date();

    if (!this.lastResults || (now - this.lastTime > this.preloadMS)) {
      if (!this.promise) {
        this.promise = this.callbackFn().then(results => {
          this.promise = null;
          this.lastTime = new Date();
          this.lastResults = results;
          return results;
        });
      }
    }

    if (this.lastResults && (now - this.lastTime < this.timeMS)) {
      return Promise.resolve(this.lastResults);
    }

    return this.promise;
  }
}
module.exports = KeepFreshRequest;
