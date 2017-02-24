import axios from 'axios';
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { fetchMapSettings } from '../actions/fetch';
import { startPolling, stopPolling } from '../actions/polling';

import s from './map.css';

const riderColours = 5;
const powerMax = 750;
const powerColours = 6;

class Map extends Component {
  static get propTypes() {
    return {
      develop: PropTypes.bool,
			worldId: PropTypes.number,
      positions: PropTypes.array,
      mapSettings: PropTypes.object,
      onFetchSettings: PropTypes.func.isRequired,
      onStartPolling: PropTypes.func.isRequired,
      onStopPolling: PropTypes.func.isRequired,
      displayActivity: PropTypes.shape({
        positions: PropTypes.arrayOf(PropTypes.shape({
          x: PropTypes.number,
          y: PropTypes.number
        }))
      })
    };
  }

  constructor(props) {
    super(props);

    this.state = {
      viewBox: undefined,
      activityIndex: -1,
      activityId: -1,
      activityInterval: null
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

    const { activityIndex, activityId, activityInterval } = this.state;
    const newState = {}

    if (activityInterval && (!props.displayActivity || props.displayActivity.id !== activityId)) {
      clearInterval(activityInterval);
      newState.activityInterval = null;
      newState.activityId = -1;
    }

    if (props.displayActivity && props.displayActivity.id !== activityId) {
      newState.activityInterval = setInterval(() => {
        let activityIndex = this.state.activityIndex + 2;
        if (activityIndex >= props.displayActivity.positions.length) {
          activityIndex = -30;
        }
        this.setState({ activityIndex });
      }, 15);
      newState.activityIndex = -30;
      newState.activityId = props.displayActivity.id;
    }

    this.setState(newState);
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
    const { develop, worldId, positions, mapSettings, displayActivity } = this.props;
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
      {(viewBox) ?
        <div className="map-riders">
          <svg className="full-size" viewBox={viewBox}>
            <defs>
              <marker id="arrowHead" orient="auto" markerWidth="1" markerHeight="2"
                      refX="0.1" refY="1">
                <path d="M0,0 V2 L1,1 Z" />
              </marker>
            </defs>

            <g transform={`rotate${mapSettings.rotate}`}>
              <g transform={`translate${mapSettings.translate}`}>

                { positions
								  ? <g id="riders" className="riders">
									    { positions.map((p, i) => this.renderPosition(p, i)) }
								    </g>
                  : undefined }

                { (displayActivity && displayActivity.positions)
                  ? this.renderActivity(displayActivity)
                  : undefined }
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

  renderActivity(displayActivity) {
    const { activityIndex } = this.state;
    const activityPosition = activityIndex >= 0 && activityIndex < displayActivity.positions.length
        ? displayActivity.positions[activityIndex] : displayActivity.positions[0];

    const points = displayActivity.positions.map(p => `${p.x},${p.y}`).join(' ');
    
    return <g id="display-activity" className="display-activity">
      <polyline points={points} />
      { activityPosition
        ? <circle cx={ activityPosition.x } cy={activityPosition.y} r="6000" />
        : undefined }
    </g>
  }

  svgPath(worldId) {
    const worldParam = worldId ? `?world=${worldId}` : '';
    return `${axios.defaults.baseURL ? axios.defaults.baseURL : ''}/map.svg${worldParam}`;
  }

  renderPosition(position, index) {
    return <g key={`rider-${index}`}
      className={this.getRiderClass(position, index)}
				transform={`translate(${position.x},${position.y})`}>
      <g transform={`rotate(${this.getLabelRotate()})`}>
        { position.trail 
          ? this.renderTrail(position)
          : undefined }
				<circle cx="0" cy="0" r="6000">
					<title>{position.power}w {Math.round(position.speed/ 1000000)}km/h</title>
				</circle>
				<text x="10000" y="2000">
					{position.firstName.substring(0, 1)} {position.lastName}
        </text>
			</g>
    </g>
  }

  renderTrail(position) {
    const { x, y, trail } = position;
    const points = trail.map(p => `${p.x - x},${p.y - y}`).join(' ');
    return <polyline points={points} markerEnd="url(#arrowHead)" />
  }

  getRiderClass(position, index) {
    const riderIndex = position.ghost ? 'ghost' : index % riderColours;
    const powerIndex = Math.round(powerColours * position.power / powerMax);

    return `rider-position rider-${riderIndex} rider-power-${powerIndex}`;
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
    mapSettings: state.mapSettings,
    displayActivity: state.ghosts.displayActivity
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
