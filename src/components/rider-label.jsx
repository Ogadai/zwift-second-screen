import React, { Component} from 'react';
import PropTypes from 'prop-types';

import s from './rider-label.css';

const M_TO_KM = 1.609344;

class RiderLabel extends Component {
  static get propTypes() {
    return {
      position: PropTypes.object.isRequired,
      scale: PropTypes.number,
      useMetric: PropTypes.bool
    };
  }

  render() {
    const { position, useMetric, scale } = this.props;
    const { totalDistanceInMeters, rideDurationInSeconds, powerOutput, weight, speedInMillimetersPerHour, heartRateInBpm } = position;
    const width = heartRateInBpm ? 265000 : 230000;
    const distFactor = useMetric ? 1 : M_TO_KM;
    const wattsPerKG = weight ? Math.round((10 * powerOutput) / (weight / 1000)) / 10 : undefined
    
    return <g className="rider-label" transform={`translate(${(50000 - width / 2) / scale},${10000 / scale})`}>
        <rect className="background" x="0" y="0" width={(width) / scale} height={30000 / scale}
            rx={5000 / scale} ry={5000 / scale} />

        {this.renderData(useMetric ? 'KM' : 'MILES', Math.round(totalDistanceInMeters / distFactor / 100) / 10, 20000)}
        {this.renderData('HRS', Math.round(rideDurationInSeconds / (60*60)), 55000)}
        {this.renderData('MIN', Math.round(rideDurationInSeconds / 60) % 60, 80000)}
        {this.renderData('WATTS', powerOutput, 120000)}
        {this.renderData('W/KG', wattsPerKG, 160000)}
        {this.renderData('SPEED', `${Math.round(speedInMillimetersPerHour / distFactor / 1000000)} ${useMetric ? 'km' : 'mph'}`, 200000)}

        { heartRateInBpm ? this.renderData('H/R', heartRateInBpm, 240000) : undefined }
    </g>
  }

  renderData(label, value, offset) {
    const { scale } = this.props;

    const props = {
      textAnchor: "middle",
      transform: `scale(${1/scale})`
    };

    return <g>
      <text className="label" x={offset} y={12000} {...props}>{label}</text>
      <text className="value" x={offset} y={25000} {...props}>{value}</text>
    </g>;
  }
}
export default RiderLabel;
