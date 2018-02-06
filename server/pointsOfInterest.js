const NodeCache = require('node-cache')

const poiCache = new NodeCache({ stdTTL: 30 * 60, checkPeriod: 120, useClones: false });

class PointsOfInterest {
  constructor(worldSettings) {
    this.worldSettings = worldSettings;
  }

  getPoints(worldId, positions, event) {
    return this.getEventPoints(worldId, event)
        .then(points => this.customiseForRider(worldId, points, positions));
  }

  customiseForRider(worldId, points, positions) {
    const position = positions && positions.find(p => p.me);
    if (!position) {
      return points;
    }

    const cacheId = `world-${worldId}-rider-${position.id}`;
    const cachedRider = poiCache.get(cacheId) || { points: [], positions: [] };

    cachedRider.positions.push(position);
    if (cachedRider.positions.length > 3) {
      cachedRider.positions.splice(0, 1);
    }

    const riderPoints = points.map(p => {
      const cachedPoint = cachedRider.points.find(c => (c.x === p.x && c.y === p.y));
      const point = cachedPoint || Object.assign({ visited: false }, p);

      point.visited = point.visited || this.checkVisited(position, cachedRider.positions, point);
      return point;
    });

    poiCache.set(cacheId, { points: riderPoints, positions: cachedRider.positions });
    return riderPoints;
  }

  checkVisited(position, recentPositions, point) {
    return !!recentPositions.find(recent => this.checkCrossedPoint(point, position, recent));
  }

  checkCrossedPoint(point, p1, p2) {
    const distance = (p1, p2) => Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));

    const gap = distance(p1, p2);
    return (distance(point, p2) < gap && distance(p1, point) < gap);
  }

  getEventPoints(worldId, event) {
    const baseSettings = this.worldSettings && this.worldSettings[worldId];
    const eventSettings = event && this.worldSettings && this.worldSettings.events && this.worldSettings.events[event]
          ? this.worldSettings.events[event][worldId]
          : undefined;

    const getPoints = (eventSettings && eventSettings.getPoints)
          ? eventSettings.getPoints
          : baseSettings.getPoints;

    if (getPoints) {
      const cacheId = (eventSettings && eventSettings.getPoints)
          ? `world-${worldId}-event-${event}-points`
          : `world-${worldId}-points`;

      const cachedPoints = poiCache.get(cacheId);
      if (cachedPoints) {
        return Promise.resolve(cachedPoints);
      } else {
        return getPoints().then(points => {
          poiCache.set(cacheId, points);
          return points;
        });
      }
    } else {
      return Promise.resolve([]);
    }
  }
}
module.exports = PointsOfInterest;
