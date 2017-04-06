import axios from 'axios';
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';

import s from './strava-route.css';

class StravaRoute extends Component {
  static get propTypes() {
    return {
      segments: PropTypes.array
    }
  }

  render() {
    const { segments } = this.props;
    return <g className="strava-route">
        { segments.map(this.renderSegment) }
    </g>
  }

  renderSegment(segment) {
    const points = segment.positions.map(p => `${p.x},${p.y}`).join(' ');
    return <g className="segment" key={`segment-${segment.id}`}>
      <polyline points={points} />
    </g>
  }
    
}

const mapStateToProps = (state) => {
  return {
    segments: (state.world.strava ? state.world.strava.segments : null) || []
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(StravaRoute);
