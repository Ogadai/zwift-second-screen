const redis = require("redis");
const NodeCache = require('node-cache')

const DEFAULT_SETTINGS = {
  ttl: 30,
  name: '',
  list: false
};

let redisStore = null;

const toPromise = (name, ...args) => {
  return new Promise((resolve, reject) => {
    redisStore[name](...args, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
}

class RedisStore {
  constructor(settings) {
    this.config = Object.assign({}, DEFAULT_SETTINGS, settings);
    this.lastCount = 0;
  }

  get(key) {
    return this.internalGet(this.key(key));
  }

  internalGet(storeKey) {
    return toPromise('get', storeKey)
      .then(res => {
        let jsonValue;
        try {
          jsonValue = res ? JSON.parse(res) : null;
        } catch (ex) {
          console.log(`Failed to parse redis result "${res}"`);
        }
        return jsonValue;
      });
  }

  getAll() {
    if (this.config.list) {
      const expireTime = Date.now() - this.config.ttl * 1000;
      return Promise.all([
        toPromise('zrangebyscore', this.config.name, expireTime, Date.now()),
        toPromise('zremrangebyscore', this.config.name, 0, expireTime)
      ])
        .then(([keys]) => {
          this.lastCount = keys.length;
          const allValues = keys
            .map(key => this.internalGet(key))
            .filter(value => !!value);
          
          return Promise.all(allValues);
        });
    }
    throw new Error('Cannot getAll() unless { list: true }');
  }

  set(key, value) {
    const storeKey = this.key(key);
    return Promise.all([
      toPromise('setex', storeKey, this.config.ttl, JSON.stringify(value)),
      this.config.list && toPromise('zadd', this.config.name, Date.now(), storeKey),
    ]).then(([setRes]) => {
      this.cleanList();
      return setRes;
    });
  }

  add(key, value) {
    const storeKey = this.key(key);
    return Promise.all([
      toPromise('incrby', storeKey, value),
      this.config.list && toPromise('zadd', this.config.name, Date.now(), storeKey),
    ]).then(([setRes]) => {
      this.ttl(key);
      this.cleanList();
      return setRes;
    });
  }

  ttl(key) {
    return toPromise('expire', this.key(key), this.config.ttl);
  }

  key(key) {
    if (this.config.name) {
      return `${this.config.name}-${key}`;
    }
    return key;
  }

  clear() {
    if (this.config.list) {
      toPromise('zrangebyscore', this.config.name, 0, Date.now())
        .then(keys => {
          Promise.all(keys.map(key => toPromise('del', key)));
          toPromise('zremrangebyscore', this.config.name, 0, Date.now());
        });
    }
  }

  cleanList() {
    if (this.config.list) {
      const expireTime = Date.now() - this.config.ttl * 1000;
      return toPromise('zremrangebyscore', this.config.name, 0, expireTime).then(() =>
          toPromise('zcount', this.config.name, expireTime, Date.now())
              .then(count => {
                this.lastCount = count;
              })
      );
    } else {
      return Promise.resolve();
    }
  }
}

class CacheStore {
  constructor(settings) {
    this.config = Object.assign({}, DEFAULT_SETTINGS, settings);

    this.cache = new NodeCache({
      stdTTL: this.config.ttl,
      checkperiod: this.config.checkperiod || (this.config.ttl / 4),
      useClones: false
    });
  }

  get(key) {
    return Promise.resolve(this.cache.get(this.key(key)))
  }

  getAll() {
    const allValues = this.cache.keys()
      .map(key => this.cache.get(key))
      .filter(val => !!val);

    return Promise.resolve(allValues);
  }

  lastCount() {
    return this.cache.keys().length;
  }

  set(key, value) {
    this.cache.set(this.key(key), value);
    return Promise.resolve();
  }

  add(key, value) {
    const oldValue = this.get(key) || 0;
    this.set(key, oldValue + value);
    return Promise.resolve();
  }

  ttl(key) {
    this.cache.ttl(this.key(key));
  }

  key(key) {
    if (this.config.name) {
      return `${this.config.name}-${key}`;
    }
    return key;
  }

  clear() {
    this.cache.flushAll();
  }
}

if (process.env.REDIS_URL) {
  redisStore = redis.createClient(process.env.REDIS_URL);
  module.exports = RedisStore;
} else {
  module.exports = CacheStore;
}
