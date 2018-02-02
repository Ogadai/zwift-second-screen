import axios from 'axios';
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';

import { fetchStravaEffort } from '../actions/fetch';

import s from './strava-route.css';

class StravaRoute extends Component {
  static get propTypes() {
    return {
      develop: PropTypes.bool,
      worldId: PropTypes.number,
      segments: PropTypes.array,
      efforts: PropTypes.object,
      scale: PropTypes.number,
      onFetchStravaEffort: PropTypes.func
    }
  }

  constructor(props) {
    super(props);

    this.loadEfforts(props.segments);
  }

  componentWillReceiveProps(props) {
    this.loadEfforts(props.segments);
  }

  getSegments(segments) {
    const { worldId, develop } = this.props;
    if (develop) {
      const ids = [
          [12109030,12128029,11596903],
          [12128826,12128917,12128762],
          [12749402,12749649]
        ][worldId-1];
      if (ids) {
        return ids.map(i => ({ id: i, start: { x: 0, y: 0}, end: { x: 100000, y: 100000 } }));
      }
    }
    return segments;
  }

  loadEfforts(segments) {
    const { onFetchStravaEffort } = this.props;

    this.getSegments(segments).forEach(s => {
      if (this.showSegment(s)) {
        onFetchStravaEffort(s.id);
      }
    });
  }

  render() {
    const { segments } = this.props;

    return <g className="strava-route">
        { this.getSegments(segments).map(s => this.renderSegment(s)) }
    </g>
  }

  showSegment(segment) {
    const distFn = (p1, p2) => Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    return distFn(segment.start, segment.end) > 10000
  }

  renderSegment(segment) {
    const { scale } = this.props;
    const effort = this.props.efforts[segment.id];
    const points = effort ? effort.map(p => `${p.x},${p.y}`).join(' ') : null;

    return <g className="segment" key={`segment-${segment.id}`}>
        { points ?
          <polyline points={points} />
        : undefined
        }
        { (segment.pr && (segment.pr.x !== undefined) && (segment.pr.y !== undefined)) ?
          <circle cx={ segment.pr.x } cy={segment.pr.y} r={ 7000 / scale } />
        : undefined
        }
      </g>
  }

}

const mapStateToProps = (state) => {
  return {
    worldId: state.world.worldId,
    segments: (state.world.strava ? state.world.strava.segments : null) || [],
    efforts: state.stravaEfforts
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    onFetchStravaEffort: (segmentId) => dispatch(fetchStravaEffort(segmentId)),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(StravaRoute);
