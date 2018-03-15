let pollInterval = 2500;

module.exports = {
  get: () => pollInterval,
  set: value => { pollInterval = value; }
};
