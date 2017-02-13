import axios from 'axios';
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { fetchMapSettings } from '../actions/fetch';
import { startPolling, stopPolling } from '../actions/polling';

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
			worldId: PropTypes.number,
      positions: PropTypes.array,
      mapSettings: PropTypes.object,
      onFetchSettings: PropTypes.func.isRequired,
      onStartPolling: PropTypes.func.isRequired,
      onStopPolling: PropTypes.func.isRequired
    };
  }

  componentDidMount() {
    const { worldId, onFetchSettings, onStartPolling } = this.props;
    onFetchSettings(worldId);

    onStartPolling();
  }

  componentWillReceiveProps(props) {
    const { worldId, onFetchSettings } = this.props;
console.log(`componentWillReceiveProps worldId: ${worldId}`);
    if (props.worldId !== worldId) {
      onFetchSettings(props.worldId);
    }
  }

  componentWillUnmount() {
    const { onStopPolling } = this.props;
    onStopPolling();
  }
	
  render() {
    const { worldId, positions, mapSettings } = this.props;
console.log(`render worldId: ${worldId}`);
    const worldParam = worldId ? `?world=${worldId}` : '';
    return <div className="map">
      <div className="map-route">
        <img className="full-size" src={`${axios.defaults.baseURL ? axios.defaults.baseURL : ''}/map.svg${worldParam}`} />
      </div>
      {(positions && mapSettings.viewBox) ?
        <div className="map-riders">
          <svg className="full-size" viewBox={mapSettings.viewBox}>
            <g transform={'rotate' + mapSettings.rotate}>
              <g transform={'translate' + mapSettings.translate}>
								<g id="riders" className="riders">
									{ positions.map((p, i) => this.renderPosition(p, i)) }
								</g>
							</g>
						</g>
					</svg>
        </div>
        : undefined}
      <div className="map-attribute">
        Map from <a href="http://zwifthacks.com/" target="_blank">zwifthacks.com</a>
      </div>
		</div>
  }

  renderPosition(position, index) {
    return <g key={`rider-${index}`} className="rider-position">
      <circle 
				cx={position.x} cy={position.y} r="6000"
				stroke={this.getRiderColour(index)} strokeWidth="2000"
				fill={this.getPowerColour(position.power)}>
        <title>{position.power}w {Math.round(position.speed/ 1000000)}km/h</title>
      </circle>
      <text x={position.x + 7500} y={position.y + 1000} fontFamily="Verdana" fontSize="7000" fontWeight="600">
        {position.firstName.substring(0, 1)} {position.lastName}
      </text>
    </g>
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
    worldId: state.world.worldId,
    positions: state.positions,
    mapSettings: state.mapSettings
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    onFetchSettings: (worldId) => dispatch(fetchMapSettings(worldId)),
    onStartPolling: () => dispatch(startPolling()),
    onStopPolling: () => dispatch(stopPolling())
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Map);
