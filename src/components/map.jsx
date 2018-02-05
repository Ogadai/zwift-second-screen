import axios from 'axios';
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';

import Rider from './rider.jsx';
import PointOfInterest from './pointOfInterest';
import StravaRoute from './strava-route.jsx';
import { fetchMapSettings } from '../actions/fetch';
import { startPolling, stopPolling } from '../actions/polling';

import s from './map.css';

class Map extends Component {
  static get propTypes() {
    return {
      develop: PropTypes.bool,
      overlay: PropTypes.bool,
			worldId: PropTypes.number,
      positions: PropTypes.array,
      mapSettings: PropTypes.object,
      zoomLevel: PropTypes.number,
      useMetric: PropTypes.bool,
      onFetchSettings: PropTypes.func.isRequired,
      onStartPolling: PropTypes.func.isRequired,
      onStopPolling: PropTypes.func.isRequired,
      displayActivity: PropTypes.shape({
        positions: PropTypes.arrayOf(PropTypes.shape({
          x: PropTypes.number,
          y: PropTypes.number
        }))
      }),
      riderFilter: PropTypes.string
    };
  }

  constructor(props) {
    super(props);

    this.state = {
      viewBox: undefined,
      activityIndex: -1,
      activityId: -1,
      activityInterval: null,
      selected: -1
    }
  }

  componentDidMount() {
    const { develop, overlay, worldId, onFetchSettings, onStartPolling } = this.props;
    onFetchSettings(worldId, overlay);

    onStartPolling();

    if (develop) this.loadDevelop(worldId);
  }

  componentWillReceiveProps(props) {
    const { develop, overlay, worldId, onFetchSettings } = this.props;

    if (props.worldId !== worldId) {
      onFetchSettings(props.worldId, overlay);
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

  componentDidUpdate() {
    if (this.riders) {
      const labels = this.riders.querySelectorAll('.rider-name');
      if (labels) {
        const rects = [];
        for(let n = labels.length - 1; n >= 0; n--) {
          const label = labels[n];
          const rect = label.querySelector('.rider-name-text').getBoundingClientRect();

          const hidden = rects.find(r => this.rectsOverlap(rect, r));
          label.style.visibility = hidden ? 'hidden' : '';
          if (!hidden) {
            rects.push(rect);
          }
        }
      }
    }
  }

  rectsOverlap(r1, r2) {
    return (r1.left < r2.right && r1.right > r2.left )
        && (r1.top < r2.bottom && r1.bottom > r2.top );
  }

  loadDevelop(worldId) {
    axios.get(this.svgPath(worldId)).then(response => {
      this.setState({
        svgFile: response.data
      });
    })
  }

  viewScale() {
    const { zoomLevel } = this.props;

    const winSize = Math.min(window.innerWidth, window.innerHeight);

    return Math.pow(zoomLevel, 0.8) * (winSize / 1000);
  }

  render() {
    const { develop, worldId, positions, pointsOfInterest, useMetric, mapSettings, displayActivity, riderFilter } = this.props;
    const { svgFile } = this.state;
    const { credit } = mapSettings;
    const viewBox = this.state.viewBox || mapSettings.viewBox;

    const mapUrl = mapSettings.map ? this.filePath(mapSettings.map) : this.svgPath(worldId);
    const labelRotate = this.getLabelRotate();

    const scale = this.viewScale();

    return <div
        className={classnames("map", { "custom-map": mapSettings && mapSettings.map })}
        style={{ backgroundColor: mapSettings.background }}
      >
      <div className="map-route">
        <div className="full-size img" style={{ backgroundImage: `url(${mapUrl})` }} />
      </div>
      {svgFile ?
        <div className="map-route" dangerouslySetInnerHTML={{ __html: this.replaceViewBox(svgFile) }} />
				: undefined
      }

      {(viewBox) ?
        <div className="map-points-of-interest">
          <svg className="full-size" viewBox={viewBox}>
            <filter id="grayscale">
              <feColorMatrix type="matrix" values="0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0      0      0      1 0"/>
            </filter>
            <g transform={`rotate${mapSettings.rotate}`}>
              <g transform={`translate${mapSettings.translate}`}>

                { pointsOfInterest
                  ? <g id="pointsOfInterest" className="points-of-iterest">
                      {pointsOfInterest.map(poi =>
                        <PointOfInterest key={poi.name} poi={poi} scale={scale} />
                      )}
                    </g>
                  : undefined }
              </g>
            </g>
          </svg>
        </div>
        : undefined}

      {(viewBox) ?
        <div className="map-riders"
              onClick={ev => { ev.stopPropagation(); this.selectRider(-1); }}
        >
          <svg className="full-size" viewBox={viewBox}>
            {this.renderDefs()}

            <g transform={`rotate${mapSettings.rotate}`}>
              <g transform={`translate${mapSettings.translate}`}>

                { positions
								  ? <g id="riders" className="riders" ref={input => this.riders = input}>
									    { this.sortRiders(positions).map((p, i) =>
                        <Rider key={`rider-${i}`}
                          position={p}
                          labelRotate={labelRotate}
                          selected={p.id === this.state.selected}
                          onClick={ev => this.clickRider(ev, p) }
                          riderFilter={riderFilter}
                          scale={scale}
                          useMetric={useMetric}
                        />)
                      }
								    </g>
                  : undefined }

                { (displayActivity && displayActivity.positions)
                  ? this.renderActivity(displayActivity)
                  : undefined }

                <StravaRoute develop={develop} scale={scale} />
							</g>
						</g>
					</svg>
        </div>
        : undefined}
      {develop ?
        <div className="map-develop">
          <input className="viewbox" type="text" value={viewBox} onKeyPress={evt => this.viewBoxKeyPress(evt)} />
        </div>
      : undefined}
		</div>
  }

  clickRider(event, position) {
    event.stopPropagation();
    this.selectRider(position.ghost ? -1 : position.id);
  }

  selectRider(id) {
    this.setState({ selected: id });
  }

  renderDefs() {
    return <defs>
        <marker id="arrowHead" orient="auto" markerWidth="1" markerHeight="2"
                refX="0.1" refY="1">
          <path d="M0,0 V2 L1,1 Z" />
        </marker>
        <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1000 1000" result="glow"/>
          <feMerge>
            <feMergeNode in="glow"/>
            <feMergeNode in="glow"/>
            <feMergeNode in="glow"/>
          </feMerge>
        </filter>
      </defs>;
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

  baseUrl() {
    return axios.defaults.baseURL ? axios.defaults.baseURL : ''
  }

  svgPath(worldId) {
    const worldParam = worldId ? `?world=${worldId}` : '';
    return `${this.baseUrl()}/map.svg${worldParam}`;
  }

  filePath(path) {
    if (path.substring(0, 4) === 'http') {
      return path;
    } else {
      return `${this.baseUrl()}${path}`
    }
  }

  getLabelRotate() {
    const { mapSettings } = this.props;
    if (mapSettings.rotate) {
      return -parseInt(mapSettings.rotate.substring(1));
    }

    return 0;
  }

  sortRiders(positions) {
    const { selected } = this.state;

    return positions.slice(0).sort((a, b) => {
      if (a.me !== b.me) {
        return a.me ? 1 : -1;
      } else if (a.ghost !== b.ghost) {
        return a.ghost ? -1 : 1;
      } else if (a.id === selected) {
        return 1;
      } else if (b.id === selected) {
        return -1;
      } else if (a.lastName && b.lastName) {
        return a.lastName.localeCompare(b.lastName)
      } else {
        return a.id - b.id;
      }
    });
  }

  viewBoxKeyPress(evt) {
    const event = evt.nativeEvent;
    const speed = event.shiftKey ? 10000 : 1000;
    console.log(`${event.shiftKey ? 'SHIFT ' : ''}${event.ctrlKey ? 'CTRL ' : ''}${event.keyCode}`)

    this.adjustViewBox(params => {
      const adjust = this.adjustVal.bind(this, params);
      const keyCode = event.shiftKey ? event.keyCode + 32 : event.keyCode;

      switch (keyCode) {
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
    positions: state.world.positions,
    pointsOfInterest: state.world.points,
    overlay: state.environment.electron || state.environment.openfin,
    mapSettings: state.mapSettings,
    displayActivity: state.ghosts.displayActivity,
    riderFilter: state.summary.riderFilter,
    zoomLevel: state.summary.zoomLevel,
    useMetric: !state.profile || state.profile.useMetric
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    onFetchSettings: (worldId, overlay) => dispatch(fetchMapSettings(worldId, overlay)),
    onStartPolling: () => dispatch(startPolling()),
    onStopPolling: () => dispatch(stopPolling())
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Map);
