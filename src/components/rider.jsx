import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';

import RiderLabel from './rider-label.jsx';
import s from './rider.css';

const riderColours = 5;
const powerMax = 750;
const powerColours = 6;

const colours = [
  'green',
  'blue',
  'red',
  'black',
  'purple',
  'orange'
];

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
    const riderName = this.getName();

    return classnames('rider-position', `rider-power-${powerIndex}`,
            riderName.colour && `rider-${riderName.colour}`,
            { selected, 'rider-ghost': position.ghost });
  }

  renderTrail() {
    const { position } = this.props;
    const { x, y, trail } = position;

    const points = trail.map(p => `${p.x - x},${p.y - y}`).join(' ');
    return <polyline points={points} markerEnd="url(#arrowHead)" />
  }

  renderName() {
    const riderName = this.getName();

    return <g>
      <text className="glow" x="10000" y="2000">{riderName.name}</text>
      <text x="10000" y="2000">{riderName.name}</text>
    </g>
  }

  getName() {
    const { position } = this.props;
    const { firstName, lastName, colour } = position;

    let modifiedLastName = lastName;
    let derivedColour = colour;

    if (!colour && modifiedLastName) {
      const hashPos = modifiedLastName.indexOf('#');
      if (hashPos !== -1) {
        const endPos = modifiedLastName.indexOf(' ', hashPos);
        const colourName = (endPos!== -1)
            ? modifiedLastName.substring(hashPos + 1, endPos).toLowerCase()
            : modifiedLastName.substring(hashPos + 1).toLowerCase();
        if (colours.find(c => (c == colourName))) {
          derivedColour = colourName;

          modifiedLastName = modifiedLastName.substring(0, hashPos) +
              ((endPos!== -1) ? modifiedLastName.substring(endPos + 1) : '');
        }
      }
    }

    const name = `${firstName ? firstName.substring(0, 1) : ''} ${modifiedLastName}`;

    return {
      name,
      colour: derivedColour
    };
  }

}

export default Rider;