var os = require('os');
var dns = require('dns');

class Host {
  constructor(port) {
    this.port = port;
  }

  getHostInfo() {
    return new Promise((resolve, reject) => {
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
