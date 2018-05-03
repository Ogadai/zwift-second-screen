const NodeCache = require('node-cache')

const poiCache = new NodeCache({ stdTTL: 30 * 60, checkperiod: 120, useClones: false });

const distance = (p1, p2) => Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));

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

  initialiseRiderProvider(worldId, event, riderProvider) {
    const pointsProvider = this.getProvider(worldId, event);
    if (pointsProvider.initialiseRiderProvider) {
      pointsProvider.initialiseRiderProvider(riderProvider);
    }
  }

  getPoints(worldId, positions, event) {
    return this.getEventPoints(worldId, event)
        .then(points => this.customiseForRider(worldId, points, positions, event));
  }

  getInfoPanel(worldId, event) {
    const pointsProvider = this.getProvider(worldId, event);

    if (pointsProvider && pointsProvider.infoPanel) {
      return pointsProvider.infoPanel();
    }
    return undefined;
  }

  customiseForRider(worldId, points, positions, event) {
    const position = positions && positions.find(p => p.me);
// TODO: Remove
// const position = { id: 101, x: 0, y: 0 };
// console.log(flags.join(','));
    if (!position) {
      return points;
    }
    this.registerPlayer(worldId, event, position);

    const cacheId = `world-${worldId}-rider-${position.id}`;
    const cachedRider = poiCache.get(cacheId) || { points: [], positions: [] };

    const riderPoints = [];
    const cloneList = [].concat(points);
    cloneList.forEach((p, index) => {
      const cachedPoint = cachedRider.points.find(c => (c.x === p.x && c.y === p.y && c.image === p.image));
      const point = cachedPoint || Object.assign({ visited: false }, p);

      const shouldCheck = (point.role !== 'finish')
          || (!riderPoints.find(p => !p.role && !p.visited));

      if (shouldCheck && !point.visited) {
        const pointVisited = checkVisited(position, cachedRider.positions, point);
        point.visited = pointVisited && pointVisited.visited;
// TODO: Remove
// point.visited = flags[index];

        if (point.visited) {
          this.pointVisited(worldId, event, p, position, pointVisited.time);
        }
      }
      riderPoints.push(point);
    });

    cachedRider.positions.push(position);
    if (cachedRider.positions.length > 3) {
      cachedRider.positions.splice(0, 1);
    }

    poiCache.set(cacheId, { points: riderPoints, positions: cachedRider.positions });
    return riderPoints;
  }

  getEventPoints(worldId, event) {
    const pointsProvider = this.getProvider(worldId, event);

    if (pointsProvider) {
      return pointsProvider.get();
    } else {
      return Promise.resolve([]);
    }
  }

  pointVisited(worldId, event, point, rider, time) {
    const pointsProvider = this.getProvider(worldId, event);

    if (pointsProvider && pointsProvider.visited) {
      pointsProvider.visited(point, rider, time);
    }
  }

  registerPlayer(worldId, event, rider) {
    const pointsProvider = this.getProvider(worldId, event);

    if (pointsProvider && pointsProvider.registerPlayer) {
      pointsProvider.registerPlayer(rider);
    }
  }

  modifyPositions(worldId, event, positions) {
    const pointsProvider = this.getProvider(worldId, event);

    if (pointsProvider && pointsProvider.modifyPositions) {
      return pointsProvider.modifyPositions(positions);
    }
    return positions;
  }

  getProvider(worldId, event) {
    const baseSettings = this.worldSettings && this.worldSettings[worldId];
    const eventSettings = event && this.worldSettings && this.worldSettings.events && this.worldSettings.events[event]
          ? this.worldSettings.events[event][worldId]
          : undefined;

    return (eventSettings && eventSettings.points)
          ? eventSettings.points
          : baseSettings.points;
  }
}

function checkVisited(position, recentPositions, point) {
  if (distance(point, position) > 15000) {
    return { visited: false };
  }

  let result = recentPositions
      .map(recent => checkCrossedPoint(point, recent, position))
      .find(v => v && v.visited);

  if (!result && recentPositions.length >= 2) {
    // Check whether user turned around and points don't quite overlap
    const lastPosition = recentPositions[recentPositions.length - 1];
    const dPosition = distance(point, position)
    const dLastPosition = distance(point, lastPosition);

    const visited = (dPosition > dLastPosition)
                 && (dPosition < distance(recentPositions[0], lastPosition));

    let time;
    if (visited) {
      const timeGapMS = position.requestTime.getTime() - lastPosition.requestTime.getTime();
      time = new Date(lastPosition.requestTime.getTime()) + (dLastPosition / (dPosition + dLastPosition)) * timeGapMS;
    }

    result = {
      visited,
      time
    };
  }

  return result;
}

function checkCrossedPoint(point, p1, p2) {
  const gap = distance(p1, p2);
  const dp2 = distance(point, p2);
  const dp1 = distance(p1, point);

  const visited = (dp2 < gap && dp1 < gap);

  let time;
  if (visited) {
    const timeGapMS = p2.requestTime.getTime() - p1.requestTime.getTime();
    time = new Date(p1.requestTime.getTime() + (dp1 / gap) * timeGapMS);
  }

  return {
    visited,
    time
  };
}
PointsOfInterest.checkVisited = checkVisited;
module.exports = PointsOfInterest;
