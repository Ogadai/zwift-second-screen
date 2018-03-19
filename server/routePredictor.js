const NodeCache = require('node-cache')
const Map = require('./map');

const cache = new NodeCache({ stdTTL: 30 * 60, checkPeriod: 10 * 60, useClones: false });

const distance = (p1, p2) => Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));

const lineLen = (l1, l2) => Math.sqrt(Math.pow(l2.y - l1.y, 2) + Math.pow(l2.x - l1.x, 2));

const lineDistance = (l1, l2, p, len) =>
        Math.abs((l2.y - l1.y) * p.x - (l2.x - l1.x) * p.y + l2.x * l1.y - l2.y * l1.x)
      / (len || lineLen(l1, l2));

const pointToLine = (l1, l2, p) => {
  const len = Math.sqrt(Math.pow(l2.y - l1.y, 2) + Math.pow(l2.x - l1.x, 2));
  const distance = lineDistance(l1, l2, p, len);

  const vector = {
    y: (l2.y - l1.y) / len,
    x: -(l2.x - l1.x) / len
  }
  return {
    distance,
    point: {
      x: p.x + distance * vector.x,
      y: p.y + distance * vector.y
    }
  };
}

module.exports = function get(worldId) {
  const cacheId = `snapper-${worldId}`;
  const fromCache = cache.get(cacheId);
  if (fromCache) {
    return fromCache;
  } else {
    const newPredictor = new RoutePredictor(worldId);
    cache.set(cacheId, newPredictor);
    return newPredictor;
  }
}

class RoutePredictor {
  constructor(worldId) {
    this.worldId = worldId;
    this.roads = null;

    this.loadRoadPoints();
  }

  predict(previous, latest, forecastTimes) {
    if (this.roads) {
      const latestPos = this.findRoad(latest);
      if (latestPos) {
        const previousPos = this.nearestPointOnRoad(latestPos.road, previous);
        if (previousPos) {
          const timeSpan = latest.requestTime - previous.requestTime;
          const speedFactor = latest.speed > 0 ? 2 * latest.speed / (latest.speed + previous.speed) : 1;

          return forecastTimes.map(time => {
            const factor = speedFactor * time / timeSpan;
            const direction = latestPos.linePosition > previousPos.linePosition ? 1 : -1;
            const linePosition = Math.max(0,
              latestPos.linePosition + factor * direction * distance(previous, latest)
            );
//console.log(`line previous: ${Math.round(previousPos.linePosition)}, latest: ${Math.round(latestPos.linePosition)}, forecast: ${Math.round(linePosition)} (gaps ${Math.round(latestPos.linePosition - previousPos.linePosition)} to ${Math.round(linePosition - latestPos.linePosition)})`);
            const pos = this.getPositionOnRoad(latestPos.road, linePosition);

            const fstr = t => Math.round(t*100)/100;
            const tstr = t => Math.round(t/100)/10;
            const sstr = s => Math.round(s/100000)/10;
//if (distance(latest, pos) > distance(previous, latest) * 3) {
//  console.log(`speed ${sstr(previous.speed)} to ${sstr(latest.speed)}, previous gap for ${tstr(latest.requestTime - previous.requestTime)}: ${Math.round(distance(previous, latest))}, after ${tstr(time)} gap is: ${Math.round(distance(latest, pos))} (factor: ${fstr(factor)}, pos: ${Math.round(linePosition)})`);
//}
            return distance(latest, pos) < 10000 ? pos : null;
          });
        }
      }
    }
    return null;
  }

  findRoad(location) {
    return this.roads
        .map(r => this.nearestPointOnRoad(r, location))
        .reduce((min, nearest) => {
          if (!min || (nearest && nearest.distance < min.distance)) {
            return nearest;
          }
          return min;
        }, null);
  }

  nearestPointOnRoad(road, location) {
    const nearest = this.findNearestToLine(location, road.all);
    return nearest ? Object.assign({ road }, nearest) : null;

    // const nearestSample = road.sample.reduce((min, point, index) => {
    //   const dist = distance(location, point);
    //   if (!min || dist < min.dist) {
    //     return { index, dist };
    //   }
    //   return min;
    // }, null);

    // const nearPoints = road.all.slice(Math.max(0, (nearestSample.index-1) * 10), (nearestSample.index+1) * 10);
    // const nearest = nearPoints.reduce((min, point, index) => {
    //   const dist = distance(location, point);
    //   if (!min || dist < min.dist) {
    //     return { road, point, index, dist };
    //   }
    //   return min;
    // }, null);

    // let neighbour;
    // if (nearest.index === 0) {
    //   neighbour = nearPoints[1];
    // } else if (nearest.index === nearPoints.length - 1) {
    //   neighbour = nearPoints[nearPoints.length - 2];
    // } else {
    //   neighbour = distance(location, nearPoints[nearest.index - 1]) < distance(location, nearPoints[nearest.index + 1])
    //       ? nearPoints[nearest.index - 1] : nearPoints[nearest.index + 1];
    // }

    // if (!neighbour) {
    //   return nearest.point;
    // }

    // const dPoint = distance(nearest.point, location);
    // const dNeighbour = distance(neighbour, location);
    // const factor = dPoint / (dPoint + dNeighbour);

    // const result = {
    //   road: nearest.road,
    //   x: nearest.point.x + (neighbour.x - nearest.point.x) * factor,
    //   y: nearest.point.y + (neighbour.y - nearest.point.y) * factor,
    // };
    // return result;
  }

  findNearestToLine(p, linePoints) {
    return linePoints.reduce((nearest, l1, index) => {
      if (index < linePoints.length - 1) {
        const l2 = linePoints[index + 1];
        const dl1 = distance(p, l1);
        const dl2 = distance(p, l2);
        const segmentLen = distance(l1, l2);

        const maxDist = Math.max(10000, segmentLen);
        if (dl1 < maxDist && dl2 < maxDist) {
          let pointOnLine = pointToLine(l1, l2, p);
          if (dl2 < dl1 && dl1 > segmentLen) {
            pointOnLine = { distance: dl2, point: l2, linePosition: l2.distance };
          } else if (dl1 < dl2 && dl2 > segmentLen) {
            pointOnLine = { distance: dl1, point: l1, linePosition: l1.distance };
          } else {
            pointOnLine.linePosition = l1.distance + (dl1 / (dl1 + dl2)) * (l2.distance - l1.distance);
          }

          if (!nearest || pointOnLine.distance < nearest.distance) {
            return pointOnLine;
          }
        }
      }
      return nearest;
    }, null);
  }

  getPositionOnRoad(road, linePosition) {
    const linePoints = road.all;
    let index = 0;
    while(index < linePoints.length - 1 && linePosition > linePoints[index + 1].distance) {
      index++;
    }

    if (index < linePoints.length - 1) {
      const l1 = linePoints[index];
      const l2 = linePoints[index + 1];

      const factor = (linePosition - l1.distance) / (l2.distance - l1.distance);
      const value = (prop) => l1[prop] + factor * (l2[prop] - l1[prop]);
      return {
        x: value('x'),
        y: value('y')
      };
    } else {
      const lEnd = linePoints[linePoints.length - 1];
      return {
        x: lEnd.x,
        y: lEnd.y
      };
    }
  }

  loadRoadPoints() {
    const map = new Map({});
    map.getSvg(this.worldId).then(svg => {
      // <polyline points="x1,y1 x2,y2"></polyline>
      let index = 0;
      const pointSets = [];
      while (index < svg.length && index !== -1) {
        index = svg.indexOf('<polyline ', index);
        if (index !== -1) {
          // Check for the points
          const polyline = this.getAttribute(svg, index, 'points');
          if (polyline) {
            // Get the class
            const className = this.getAttribute(svg, index, 'class') || '';
            const classes = className.split(' ');
            if (classes.find(c => c == 'roadline')) {
              const linePoints = this.pointsFromPolyline(polyline)
              if (linePoints.length > 2) {
                pointSets.push(linePoints);
              }
            }
          }
          index += 8;
        }
      }

      this.roads = pointSets.map(r => this.processRoad(r));
    });
  }

  getAttribute(elementStr, elementIndex, attributeName) {
    const index = elementStr.indexOf(`${attributeName}="`, elementIndex);
    if (index !== -1) {
      const len = attributeName.length + 2;
      const endIndex = elementStr.indexOf('"', index + len);
      if (endIndex !== -1) {
        return elementStr.substring(index + len, endIndex);
      }
    }
    return null;
  }

  pointsFromPolyline(polyline) {
    let lastPoint = null;
    return polyline.split(' ')
        .map(pair => {
          const coords = pair.split(',');
          if (coords.length === 2) {
            const point = {
              x: parseFloat(coords[0]),
              y: parseFloat(coords[1])
            };
            const pointDistance = lastPoint ? lastPoint.distance + distance(lastPoint, point) : 0;
            if (!lastPoint || (pointDistance - lastPoint.distance > 500)) {
              lastPoint = Object.assign(point, { distance: pointDistance });
              return lastPoint;
            }
          }
        })
        .filter(point => !!point);
  }

  processRoad(roadPoints) {
    return {
      all: roadPoints,
      sample: roadPoints.filter((p, i) => (i % 10) === 0)
    };
  }
}
