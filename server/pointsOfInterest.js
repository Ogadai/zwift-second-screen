const NodeCache = require('node-cache')

const poiCache = new NodeCache({ stdTTL: 30 * 60, checkPeriod: 120, useClones: false });

// TODO: Remove
// let counter = 0;
// const flags = [false, false, false, false, false];
// setTimeout(() => {
// setInterval(() => {
//   if (counter < flags.length) {
//     flags[counter] = true;
//   }

//   if (counter === 0 || counter === 2) {
// //    flags[0] = false;
//     flags[4] = true;
//   } else if (counter === 1 || counter === 3) {
//     flags[4] = false;
//   }
//   counter++;
// }, 5000);
// }, 10000);

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
// TODO: Remove
// const position = { id: 101, x: 0, y: 0 };
// console.log(flags.join(','));
    if (!position) {
      return points;
    }

    const cacheId = `world-${worldId}-rider-${position.id}`;
    const cachedRider = poiCache.get(cacheId) || { points: [], positions: [] };

    cachedRider.positions.push(position);
    if (cachedRider.positions.length > 3) {
      cachedRider.positions.splice(0, 1);
    }

    const riderPoints = [];
    points.forEach((p, index) => {
      const cachedPoint = cachedRider.points.find(c => (c.x === p.x && c.y === p.y && c.image === p.image));
      const point = cachedPoint || Object.assign({ visited: false }, p);

      const shouldCheck = (point.role !== 'finish')
          || (!riderPoints.find(p => !p.role && !p.visited));

      if (shouldCheck && !point.visited) {
        point.visited = this.checkVisited(position, cachedRider.positions, point);
// TODO: Remove
// point.visited = flags[index];
      }
      riderPoints.push(point);
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
