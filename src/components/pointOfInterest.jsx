import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';

import images from '../images/images';
import s from './pointOfInterest.css';

const SIZE = 12000;

class PointOfInterest extends Component {
  static get propTypes() {
    return {
      poi: PropTypes.shape({
        name: PropTypes.string,
        x: PropTypes.number,
        y: PropTypes.number
      }),
      scale: PropTypes.number
    };
  }

  render() {
    const { poi, scale } = this.props;
    const { name, x, y, image, rotate, visited } = poi;
    const iconSize = poi.size || 1;

    const scaledSize = iconSize * SIZE/scale;
    const imageSrc = image && images[image] ? images[image] : images.standard;

    return <g className={classnames('point-of-interest', { visited })} transform={`translate(${x},${y})`}>
      <g transform={`rotate(${rotate || 0})`}>
        <image x={-scaledSize} y={-scaledSize} width={ 2 * scaledSize } height={ 2 * scaledSize } xlinkHref={imageSrc} />
      </g>
    </g>;
  }

}

export default PointOfInterest;