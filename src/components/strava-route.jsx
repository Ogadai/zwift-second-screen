import axios from 'axios';
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';

import { fetchStravaEffort } from '../actions/fetch';

import s from './strava-route.css';

class StravaRoute extends Component {
  static get propTypes() {
    return {
      segments: PropTypes.array,
      efforts: PropTypes.object,
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

  loadEfforts(segments) {
    const { onFetchStravaEffort } = this.props;
    segments.forEach(s => {
      if (this.showSegment(s)) {
        onFetchStravaEffort(s.id);
      }
    });
  }

  render() {
    const { segments } = this.props;

    return <g className="strava-route">
        { segments.map(s => this.renderSegment(s)) }
    </g>
  }

  showSegment(segment) {
    const distFn = (p1, p2) => Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    return distFn(segment.start, segment.end) > 10000
  }

  renderSegment(segment) {
    const effort = this.props.efforts[segment.id];
    const points = effort ? effort.map(p => `${p.x},${p.y}`).join(' ') : null;

    return <g className="segment" key={`segment-${segment.id}`}>
        { points ?
          <polyline points={points} />
        : undefined
        }
        { segment.pr ?
          <circle cx={ segment.pr.x } cy={segment.pr.y} r="6000" />
        : undefined
        }
      </g>
  }
    
}

const mapStateToProps = (state) => {
  return {
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
