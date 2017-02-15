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
      develop: PropTypes.bool,
			worldId: PropTypes.number,
      positions: PropTypes.array,
      mapSettings: PropTypes.object,
      onFetchSettings: PropTypes.func.isRequired,
      onStartPolling: PropTypes.func.isRequired,
      onStopPolling: PropTypes.func.isRequired
    };
  }

  constructor(props) {
    super(props);

    this.state = {
      viewBox: undefined
    }
  }

  componentDidMount() {
    const { develop, worldId, onFetchSettings, onStartPolling } = this.props;
    onFetchSettings(worldId);

    onStartPolling();

    if (develop) this.loadDevelop(worldId);
  }

  componentWillReceiveProps(props) {
    const { develop, worldId, onFetchSettings } = this.props;
    if (props.worldId !== worldId) {
      onFetchSettings(props.worldId);
      if (develop) this.loadDevelop(props.worldId);
    }
  }

  componentWillUnmount() {
    const { onStopPolling } = this.props;
    onStopPolling();
  }

  loadDevelop(worldId) {
    axios.get(this.svgPath(worldId)).then(response => {
      this.setState({
        svgFile: response.data
      });
    })
  }
	
  render() {
    const { develop, worldId, positions, mapSettings } = this.props;
    const { svgFile } = this.state;
    const { credit } = mapSettings;
    const viewBox = this.state.viewBox || mapSettings.viewBox;

    return <div className="map">
      <div className="map-route">
        <div className="full-size img" style={{ backgroundImage: `url(${mapSettings.map || this.svgPath(worldId)})` }} />
      </div>
      {svgFile ?
        <div className="map-route" dangerouslySetInnerHTML={{ __html: this.replaceViewBox(svgFile) }} />
				: undefined
      }
      {(positions && viewBox) ?
        <div className="map-riders">
          <svg className="full-size" viewBox={viewBox}>
            <g transform={`rotate${mapSettings.rotate}`}>
              <g transform={`translate${mapSettings.translate}`}>
								<g id="riders" className="riders">
									{ positions.map((p, i) => this.renderPosition(p, i)) }
								</g>
							</g>
						</g>
					</svg>
        </div>
        : undefined}
      {credit ?
				<div className="map-attribute">
          Map by <a href={credit.href} target="_blank">{credit.name}</a>
				</div>
			: undefined }
      {develop ?
        <div className="map-develop">
          <input className="viewbox" type="text" value={viewBox} onKeyPress={evt => this.viewBoxKeyPress(evt)} />
        </div>
      : undefined}
		</div>
  }

  svgPath(worldId) {
    const worldParam = worldId ? `?world=${worldId}` : '';
    return `${axios.defaults.baseURL ? axios.defaults.baseURL : ''}/map.svg${worldParam}`;
  }

  renderPosition(position, index) {
    return <g key={`rider-${index}`} className="rider-position" transform={`translate(${position.x},${position.y})`}>
      <g transform={`rotate(${this.getLabelRotate()})`}>
				<circle 
					cx="0" cy="0" r="6000"
					stroke={this.getRiderColour(index)} strokeWidth="2000"
					fill={this.getPowerColour(position.power)}>
					<title>{position.power}w {Math.round(position.speed/ 1000000)}km/h</title>
				</circle>
				<text x="10000" y="2000" fontFamily="Verdana" fontSize="9000" fontWeight="600">
					{position.firstName.substring(0, 1)} {position.lastName}
        </text>
			</g>
    </g>
  }

  getRiderColour(index) {
    return riderColours[index % riderColours.length];
  }

  getPowerColour(power) {
    let powerIndex = Math.round(powerColours.length * power / powerMax);
    return powerColours[Math.min(powerIndex, powerColours.length - 1)];
  }

  getLabelRotate() {
    const { mapSettings } = this.props;
    if (mapSettings.rotate) {
      return -parseInt(mapSettings.rotate.substring(1));
    }

    return 0;
  }

  viewBoxKeyPress(evt) {
    const event = evt.nativeEvent;
    const speed = event.shiftKey ? 10000 : 1000;
    console.log(`${event.shiftKey ? 'SHIFT ' : ''}${event.ctrlKey ? 'CTRL ' : ''}${event.keyCode}`)

    this.adjustViewBox(params => {
      const adjust = this.adjustVal.bind(this, params);

      switch (event.keyCode) {
        case 119: // w
          return adjust(1, speed);
        case 97: // a
          return adjust(0, speed);
        case 115: // s
          return adjust(1, -speed);
        case 100: // d
          return adjust(0, -speed);
				case 105: // i
          return adjust(3, speed);
        case 106: // j
          return adjust(2, speed);
        case 107: // k
          return adjust(3, -speed);
        case 108: // l
          return adjust(2, -speed);
        default:
          return params;
      }
    });
  }

  adjustViewBox(adjustFn) {
    const { mapSettings } = this.props;
    const viewBox = this.state.viewBox || mapSettings.viewBox;
    const params = viewBox.split(' ')
			.filter(v => v.length)
      .map(v => parseInt(v));
    
    const updatedParams = adjustFn(params)

    const newViewBox = updatedParams.join(' ')
    this.setState({ viewBox: newViewBox });
  }

  adjustVal(array, index, adjustment) {
    const result = array.slice(0);
    result[index] += adjustment;
    return result;
  }

  replaceViewBox(svgFile) {
    const { mapSettings } = this.props;
    const viewBox = this.state.viewBox || mapSettings.viewBox;
    const tag = 'viewBox="'
    const startPos = svgFile.indexOf(tag);
    const endPos = svgFile.indexOf('"', startPos + tag);
    return `${svgFile.substring(0, startPos)}viewBox="${viewBox}" class="full-size" style="width:auto;height:auto;background-color: rgba(255, 0, 0, 0.1);" ${svgFile.substring(endPos)}`;
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
