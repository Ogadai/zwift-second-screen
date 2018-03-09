import React, { Component } from 'react';
import PropTypes from 'prop-types';
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
  'orange',
  'yellow'
];

const blankSpace = ' []()-_:.';
const UPDATE_MS = 250;

class Rider extends Component {
  static get propTypes() {
    return {
      position: PropTypes.object.isRequired,
      index: PropTypes.number,
      labelRotate: PropTypes.number,
      selected: PropTypes.bool,
      onClick: PropTypes.func.isRequired,
      riderFilter: PropTypes.string,
      scale: PropTypes.number,
      useMetric: PropTypes.bool,
      interval: PropTypes.number
    };
  }

  constructor(props) {
    super(props);

    this.state = {
      position: props.position
    };
    this.interval = null;
  }

  componentWillReceiveProps(props) {
    const thisPosition = props.position;
    const lastPosition = this.props.position;
    const interval = Math.max(props.interval, 5000);

    if (thisPosition.x === lastPosition.x && thisPosition.y === lastPosition.y) {
      return;
    }

    if (this.interval) {
      clearInterval(this.interval);
    }

    this.setState({
      position: lastPosition
    });

    let fraction = 0;
    this.interval = setInterval(() => {
      fraction = Math.min(fraction + (UPDATE_MS / interval), 1);
      const position = Object.assign({}, thisPosition, {
        x: lastPosition.x + fraction * (thisPosition.x - lastPosition.x),
        y: lastPosition.y + fraction * (thisPosition.y - lastPosition.y)
      });
      this.setState({ position });
    }, UPDATE_MS);
  }

  render() {
    const { selected, labelRotate, scale, useMetric, onClick } = this.props;
    const { position } = this.state;

    return <g className={this.getRiderClass()}
				transform={`translate(${position.x},${position.y})`}>
      { position.trail
        ? this.renderTrail()
        : undefined }
      <g transform={`rotate(${labelRotate})`} onClick={onClick}>
        <circle cx="0" cy="0" r={ 6000 / scale } style={{ strokeWidth: 2000 / scale }} />
        {this.renderName()}
        { selected ? <RiderLabel position={position}  scale={scale} useMetric={useMetric} /> : undefined }
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
    const { position } = this.state;
    const { x, y, trail } = position;

    const points = trail.map(p => `${p.x - x},${p.y - y}`).join(' ');
    return <polyline points={points} markerEnd="url(#arrowHead)" />
  }

  renderName() {
    const { scale } = this.props;
    const riderName = this.getName();

    const props = {
      x: 10000,
      y: 3000,
      transform: `scale(${1/scale})`
    };

    return <g className="rider-name">
      <text className="glow" {...props}>{riderName.name}</text>
      <text className="rider-name-text" {...props}>{riderName.name}</text>
    </g>
  }

  getName() {
    const { position, riderFilter } = this.props;
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

    if (riderFilter && modifiedLastName) {
      const filterPos = modifiedLastName.toLowerCase().indexOf(riderFilter.toLowerCase());
      const filterLen = riderFilter.length;

      const isBlank = (char) => {
        return blankSpace.indexOf(char) !== -1;
      }

      if (
           filterPos !== -1
        && ((filterPos === 0) || isBlank(modifiedLastName[filterPos-1]))
        && ((filterPos + filterLen === modifiedLastName.length) || isBlank(modifiedLastName[filterPos+filterLen]))
        ) {
        // Remove the filter from the name
        modifiedLastName = modifiedLastName.substring(0, filterPos).trim() + ' '
            + modifiedLastName.substring(filterPos + filterLen).trim();
      }
    }

    modifiedLastName = modifiedLastName.trim();

    const displayFirstName = (firstName && modifiedLastName.length > 3)
        ? firstName.substring(0, 1)
        : (firstName || '');

    const name = `${displayFirstName} ${modifiedLastName}`.trim();

    return {
      name,
      colour: derivedColour
    };
  }

}

export default Rider;