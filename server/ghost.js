const EventEmitter = require('events')

class Ghost extends EventEmitter {
  constructor(activity, ghostId, staticData) {
    super();

    this.activity = activity;
    this.static = staticData || {};
    this.startTime = new Date();
    this.startOffset = 0;
    this.id = ghostId;
  }

  getId() {
    return this.id;
  }

  getDetails() {
    const { worldId, name, firstName, lastName } = this.activity;

    return {
			id: this.id,
      worldId,
      name,
      firstName,
      lastName
    };
  }

  getOffsetTime() {
    return ((new Date()) - this.startTime + this.startOffset);
  }

  getPosition() {
    const offset = this.getOffsetTime();
    const { positions } = this.activity;

    const index = this.getIndex();

    const baseResult = {
        firstName: this.activity.firstName,
        lastName: this.activity.lastName,
				ghost: true
    };

    if (index < positions.length) {
      const position = positions[index - 1];
      const nextPosition = positions[index];
      const remain = offset - position.time * 1000;
      const ratio = remain / ((nextPosition.time - positions[index - 1].time) * 1000);

      const trail = positions
          .slice(index, index + 20)
          .map(p => ({ x: p.x, y: p.y }));

      const getAggregated = name => Math.round(position[name] + ratio * (nextPosition[name] - position[name]));
      const power = getAggregated('power');
      const wattsPerKG = this.getWattsPerKg(power, this.static.weight);

      return Object.assign(baseResult, {
        x: getAggregated('x'),
        y: getAggregated('y'),
        speed: getAggregated('speed'),
        cadence: getAggregated('cadence'),
        power,
        wattsPerKG,
        trail
      });
    } else {
      return Object.assign(baseResult,
        positions[positions.length - 1], {
          power: 0,
          speed: 0,
          cadence: 0
        });
    }
  }

  getWattsPerKg(power, weight) {
      return weight ? Math.round((10 * power) / (weight / 1000)) / 10 : undefined;
  }

  isFinished() {
    const offset = this.getOffsetTime();
    const { positions } = this.activity;

    return (offset > positions[positions.length - 1].time * 1000 + 10000);
  }

  getIndex() {
    const offset = this.getOffsetTime();
    const { positions } = this.activity;

    let index = 1;
    while (index < positions.length && positions[index].time * 1000 < offset) {
      index++;
    }
    return index;
  }

  regroup(position) {
    const index = this.getIndex();
    const forwardIndex = this.findClosePosition(index, position, 1);
    const backIndex = this.findClosePosition(index, position, -1);

    let newIndex = index;
    if (forwardIndex !== -1 && backIndex !== -1) {
      if (forwardIndex - index < index - backIndex) {
        newIndex = forwardIndex;
      } else {
        newIndex = backIndex;
      }
    } else if (forwardIndex !== -1) {
      newIndex = forwardIndex;
    } else if (backIndex !== -1) {
      newIndex = backIndex;
    }

    if (newIndex !== index) {
      this.setPosition(newIndex);
    }
    return newIndex;
  }

  findClosePosition(index, position, direction) {
    const { positions } = this.activity;

    let tryIndex = index;
    if (tryIndex < 1) tryIndex = 1;
    if (tryIndex >= positions.length - 1) tryIndex = positions.length - 1;
    while (!this.isCloseEnough(tryIndex, position) && tryIndex > 0 && tryIndex < positions.length - 1) {
      tryIndex += direction;
    }

    if (tryIndex > 0 && tryIndex < positions.length - 1) {
      return this.getClosestIndex(position, tryIndex - 10, tryIndex + 10);
     }
     return -1;
  }

  isCloseEnough(index, position) {
    if (!this.activity.positions[index]) return false;

    const distance = this.distance(index, position)
    return distance < 5000;
  }

  distance(index, position) {
    const match = this.activity.positions[index];

    return Math.sqrt(Math.pow(position.x-match.x, 2) + Math.pow(position.y-match.y, 2));
  }

  setPosition(index) {
    const { positions } = this.activity;

    this.startTime = new Date();
    this.startOffset = positions[index].time * 1000;
  }

  getClosestIndex(position, lowest, highest) {
    const { positions } = this.activity;

    const from = Math.max(0, lowest);
    const to = Math.min(positions.length, highest);

    let closest = null;
    for(let n = from; n < to; n++) {
      const distance = this.distance(n, position);

      if (!closest || distance < closest.distance) {
        closest = {
          index: n,
          distance
        };
      }
    }
    return closest ? closest.index : -1;
  }
}
module.exports = Ghost;
