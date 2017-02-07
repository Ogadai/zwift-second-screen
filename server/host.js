var os = require('os');
var dns = require('dns');

class Host {
  constructor(settings) {
    this.port = settings.port;
  }

  getHostInfo() {
    return new Promise((resolve, reject) => {
      if (!this.username) {
        const hostName = os.hostname();
        let resolved = false;

        dns.lookup(hostName, (err, address) => {
          if (!resolved) {
            resolved = true;

            resolve({
              hosts: [
                this.formatHost(hostName),
                this.formatHost(address)
              ]
            });
          }
        });
      } else {
				// Not using local hosting
        resolve({});
      }
    });
  }

  formatHost(host) {
    if (this.port === 80) {
      return `http://${host}`
    } else {
      return `http://${host}:${this.port}`
    }
  }

}
module.exports = Host;
