import React, { Component} from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import s from './rider-label.css';

const M_TO_KM = 1.609344;

class RiderLabel extends Component {
  static get propTypes() {
    return {
      position: PropTypes.object.isRequired,
      scale: PropTypes.number,
      useMetric: PropTypes.bool,
      onRideOn: PropTypes.func,
      sentRideOn: PropTypes.bool
    };
  }

  render() {
    const { position, useMetric, scale } = this.props;
    const { distance, time, power, wattsPerKG, speed, heartrate } = position;
    const width = heartrate ? 265000 : 230000;
    const distFactor = useMetric ? 1 : M_TO_KM;

    return <g className="rider-label" transform={`translate(${(50000 - width / 2) / scale},${10000 / scale})`}>
        <rect className="background" x="0" y="0" width={(30000 + width) / scale} height={30000 / scale}
            rx={5000 / scale} ry={5000 / scale} />

        {this.renderRideOnButton()}

        {this.renderData(useMetric ? 'KM' : 'MILES', Math.round(distance / distFactor / 100) / 10, 20000)}
        {this.renderData('HRS', Math.round(time / (60*60)), 55000)}
        {this.renderData('MIN', Math.round(time / 60) % 60, 80000)}
        {this.renderData('WATTS', power, 120000)}
        {this.renderData('W/KG', wattsPerKG, 160000)}
        {this.renderData('SPEED', `${Math.round(speed / distFactor / 1000000)} ${useMetric ? 'km' : 'mph'}`, 200000)}

        { heartrate ? this.renderData('H/R', heartrate, 240000) : undefined }
    </g>
  }

  renderData(label, value, offset) {
    const { scale } = this.props;
    const transform = `scale(${1/scale})`;

    const props = {
      textAnchor: "middle",
      transform: `scale(${1/scale})`
    };

    return <g>
      <text className="label" x={30000 + offset} y={12000} {...props}>{label}</text>
      <text className="value" x={30000 + offset} y={25000} {...props}>{value}</text>
    </g>;
  }

  renderRideOnButton() {
    const { scale, onRideOn, sentRideOn } = this.props;
    const transform = `scale(${1/scale})`;

    return <g>
      {onRideOn && <rect className={classnames('rideOn', { disabled: sentRideOn })}
          x={3000 / scale} y={3000 / scale} width={24000 / scale} height={24000 / scale}
          rx={5000 / scale} ry={5000 / scale} onClick={() => onRideOn()} />}

      {onRideOn && <image className="rideOn-thumb"
          x={8000 / scale} y={8000 / scale} width={14000 / scale} height={14000 / scale}
          xlinkHref="../../img/rideon.svg" />}
    </g>;
  }
}
export default RiderLabel;
