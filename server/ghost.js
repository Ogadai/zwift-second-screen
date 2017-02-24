const EventEmitter = require('events')

class Ghost extends EventEmitter {
  constructor(activity, ghostId) {
    super();

    this.activity = activity;
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

  getPosition() {
    const offset = (new Date()) - this.startTime + this.startOffset;
    const { positions } = this.activity;

    const index = this.getIndex()

    if (index < positions.length) {
      const position = positions[index - 1];
      const nextPosition = positions[index];
      const remain = offset - position.time * 1000;
      const ratio = remain / ((nextPosition.time - positions[index - 1].time) * 1000);

      const trail = positions.slice(index, index + 20);

      const getAggregated = name => position[name] + ratio * (nextPosition[name] - position[name]);

      return {
        firstName: this.activity.firstName,
        lastName: this.activity.lastName,
				ghost: true,
        x: getAggregated('x'),
        y: getAggregated('y'),
        speed: getAggregated('speed'),
        power: getAggregated('power'),
        cadence: getAggregated('cadence'),
        trail
      };
    } else {
      return positions[positions.length - 1];
    }
  }

  getIndex() {
    const offset = (new Date()) - this.startTime + this.startOffset;
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

    return (tryIndex > 0 && tryIndex < positions.length - 1) ? tryIndex : -1;
  }

  isCloseEnough(index, position) {
    if (!this.activity.positions[index]) return false;
    const match = this.activity.positions[index];

    const distance = Math.sqrt(Math.pow(position.x-match.x, 2) + Math.pow(position.y-match.y, 2));
    return distance < 5000;
  }

  setPosition(index) {
    const { positions } = this.activity;

    this.startTime = new Date();
    this.startOffset = positions[index].time * 1000;
  }
}
module.exports = Ghost;
