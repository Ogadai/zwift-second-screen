const EventEmitter = require('events')

class Ghost extends EventEmitter {
  constructor(activity) {
    super();

    this.activity = activity;
    this.startTime = new Date();
    this.startOffset = 0;
  }

  getPosition() {
    const offset = (new Date()) - this.startTime + this.startOffset;
    const { positions } = this.activity;

    let index = 1;
    while (index < positions.length && positions[index].time * 1000 < offset) {
      index++;
    }

    if (index < positions.length) {
      const position = positions[index - 1];
      const nextPosition = positions[index];
      const remain = offset - position.time * 1000;
      const ratio = remain / ((nextPosition.time - positions[index - 1].time) * 1000);

      const getAggregated = name => position[name] + ratio * (nextPosition[name] - position[name]);

      return {
        firstName: 'a',
        lastName: 'ghost',
				ghost: true,
        x: getAggregated('x'),
        y: getAggregated('y'),
        speed: getAggregated('speed'),
        power: getAggregated('power'),
        cadence: getAggregated('cadence')
      };
    } else {
      return positions[positions.length - 1];
    }
  }
}
module.exports = Ghost;
