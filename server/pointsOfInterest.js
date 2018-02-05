const NodeCache = require('node-cache')

const poiCache = new NodeCache({ stdTTL: 30 * 60, checkPeriod: 120, useClones: false });

class PointsOfInterest {
  constructor(worldSettings) {
    this.worldSettings = worldSettings;
  }

  getPoints(worldId, positions, event) {
    const baseSettings = this.worldSettings && this.worldSettings[worldId];
    const eventSettings = event && this.worldSettings && this.worldSettings.events && this.worldSettings.events[event]
          ? this.worldSettings.events[event][worldId]
          : undefined;

    const getPoints = (eventSettings && eventSettings.getPoints)
          ? eventSettings.getPoints
          : baseSettings.getPoints;

    if (getPoints) {
      return getPoints();
    } else {
      return Promise.resolve([]);
    }
  }
}
module.exports = PointsOfInterest;
