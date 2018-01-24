import React, { Component, PropTypes } from 'react';

import s from './rider-label.css';

class RiderLabel extends Component {
  static get propTypes() {
    return {
      position: PropTypes.object.isRequired
    };
  }

  render() {
    const { position, scale } = this.props;
    const { distance, time, power, wattsPerKG, speed, heartrate } = position;
    const width = heartrate ? 265000 : 230000;

    return <g className="rider-label" transform={`translate(${(50000 - width / 2) / scale},${10000 / scale})`}>
        <rect className="background" x="0" y="0" width={width / scale} height={30000 / scale}
            rx={5000 / scale} ry={5000 / scale} />

        {this.renderData('KM', Math.round(distance / 100) / 10, 20000)}
        {this.renderData('HRS', Math.round(time / (60*60)), 55000)}
        {this.renderData('MIN', Math.round(time / 60) % 60, 80000)}
        {this.renderData('WATTS', power, 120000)}
        {this.renderData('W/KG', wattsPerKG, 160000)}
        {this.renderData('SPEED', `${Math.round(speed / 1000000)} km`, 200000)}

        { heartrate ? this.renderData('H/R', heartrate, 240000) : undefined }
    </g>
  }

  renderData(label, value, offset) {
    const { scale } = this.props;
    const style = {
      transform: `scale(${1/scale})`
    };

    return <g>
      <text className="label" x={offset} y={12000} textAnchor="middle" style={style}>{label}</text>
      <text className="value" x={offset} y={25000} textAnchor="middle" style={style}>{value}</text>
    </g>
  }
}
export default RiderLabel;
