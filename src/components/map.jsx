import axios from 'axios';
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { fetchPositions, fetchMapSettings } from '../actions';

import s from './map.css';

const riderColours = [
  "#A81C07", //red
	"#0077BE", //blue
  "#317873", //green
	"#FF8C00", //orange
	"#B768A2" //pink
];

const powerMax = 750;
const powerColours = [
  "#0077BE", //blue
  "#90EE90", //green
  "#FFEF00", //yellow
	"#FF8C00", //orange
  "#E03C31", //red,
	"#FFB0B0"  //white
];

class Map extends Component {
  static get propTypes() {
    return {
			overlay: PropTypes.bool,
      positions: PropTypes.array,
			mapSettings: PropTypes.object,
      onFetch: PropTypes.func.isRequired,
      onFetchSettings: PropTypes.func.isRequired
    };
  }

  componentDidMount() {
    const { onFetch, onFetchSettings } = this.props;
    onFetch();
    onFetchSettings();
    this.fetchInterval = setInterval(onFetch, 5000);
  }

  componentWillUnmount() {
    clearInterval(this.fetchInterval);
  }
	
  render() {
    const { overlay, positions, mapSettings } = this.props;
    const transforms = !overlay && mapSettings.transforms ? mapSettings.transforms : [];

    return <div className="map">
      {(overlay || !mapSettings.png)
        ? <div className="map-route">
					  <img className="full-size svg-map" src={`${axios.defaults.baseURL ? axios.defaults.baseURL : ''}/map.svg`} />
					</div>
        : <div className="map-route">
	          <img className="full-size png-map" src={mapSettings.png} />
					</div>
      }

      <div className="map-route">
        <img className="full-size svg-map" src={`${axios.defaults.baseURL ? axios.defaults.baseURL : ''}/map.svg`} />
      </div>
      
      {(positions && mapSettings.viewBox) ?
        <div className="map-riders">
          <svg className="full-size svg-map" viewBox={mapSettings.viewBox}>
            {this.renderTransforms(transforms, 0)}
					</svg>
        </div>
        : undefined}
			</div>
  }

  renderTransforms(transforms, index) {
    return (index < transforms.length)
      ? <g transform={transforms[index]}>{this.renderTransforms(transforms, index + 1)}</g>
      : this.renderRiders()
  }

  renderRiders() {
    let { positions, mapSettings } = this.props;

    positions = [
      { x: 143948, y: -240914, power: 100, speed: 25000000, firstName: "Andy", lastName: "Lee" }
    ];

    return <g transform={'rotate' + mapSettings.rotate}>
      <g transform={'translate' + mapSettings.translate}>
        <g id="riders" className="riders">
          {positions.map((p, i) => this.renderPosition(p, i))}
        </g>
      </g>
    </g>
  }

  renderPosition(position, index) {
    return <g key={`rider-${index}`}
      className="rider-position"
      transform={`translate(${position.x},${position.y})`}>
      <circle 
				cx="0" cy="0" r="6000"
				stroke={this.getRiderColour(index)} strokeWidth="2000"
				fill={this.getPowerColour(position.power)}>
        <title>{position.power}w {Math.round(position.speed/ 1000000)}km/h</title>
      </circle>
      <text x={7500} y={1000} fontFamily="Verdana" fontSize="7000" fontWeight="600" transform={this.getRiderRotate()}>
        {position.firstName.substring(0, 1)} {position.lastName}
      </text>
    </g>
  }

  getRiderRotate() {
    const { rotate } = this.props.mapSettings;
    const start = rotate.indexOf('(') + 1;
    const end = rotate.indexOf(',', start);
    const angle = parseInt(rotate.substring(start, end));

    return `rotate(${-angle})`;
  }

  getRiderColour(index) {
    return riderColours[index % riderColours.length];
  }

  getPowerColour(power) {
    let powerIndex = Math.round(powerColours.length * power / powerMax);
    console.log(powerIndex);
    return powerColours[Math.min(powerIndex, powerColours.length - 1)];
  }

  getSvgParam(searchTerm) {
    const { world } = this.props;
    const map = maps[world];
    const pos = map.indexOf(searchTerm);
    if (pos !== -1) {
      const start = pos + searchTerm.length;
      const end = map.indexOf('"', start);
      return map.substring(start, end);
    }
    return '';
  }
}

const mapStateToProps = (state) => {
  return {
    overlay: state.environment.electron,
    positions: state.positions,
    mapSettings: state.mapSettings
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    onFetchSettings: () => dispatch(fetchMapSettings()),
    onFetch: () => dispatch(fetchPositions())
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Map);
