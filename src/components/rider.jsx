import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';

import RiderLabel from './rider-label.jsx';
import s from './rider.css';

const riderColours = 5;
const powerMax = 750;
const powerColours = 6;

class Rider extends Component {
  static get propTypes() {
    return {
      position: PropTypes.object.isRequired,
      index: PropTypes.number,
      labelRotate: PropTypes.number,
      selected: PropTypes.bool,
      onClick: PropTypes.func.isRequired
    };
  }

  render() {
    const { position, selected, labelRotate, onClick } = this.props;

    return <g className={this.getRiderClass()}
				transform={`translate(${position.x},${position.y})`}>
      { position.trail 
        ? this.renderTrail()
        : undefined }
      <g transform={`rotate(${labelRotate})`} onClick={onClick}>
        <circle cx="0" cy="0" r="6000" />
        {this.renderName()}
        { selected ? <RiderLabel position={position} /> : undefined }
      </g>
    </g>
  }

  getRiderClass() {
    const { selected, position } = this.props;
    const powerIndex = Math.min(Math.floor(position.wattsPerKG), 8);

    return classnames('rider-position', `rider-power-${powerIndex}`,
            { selected, 'rider-ghost': position.ghost });
  }

  renderTrail() {
    const { position } = this.props;
    const { x, y, trail } = position;

    const points = trail.map(p => `${p.x - x},${p.y - y}`).join(' ');
    return <polyline points={points} markerEnd="url(#arrowHead)" />
  }

  renderName() {
    const { position } = this.props;
    const nameLabel = `${position.firstName ? position.firstName.substring(0, 1) : ''} ${position.lastName}`;

    return <g>
      <text className="glow" x="10000" y="2000">{nameLabel}</text>
      <text x="10000" y="2000">{nameLabel}</text>
    </g>
  }

  renderLabel() {
    const { position } = this.props;
    return <g>
        <text x="10000" y="15000">Label</text>
    </g>
  }
	
}

export default Rider;