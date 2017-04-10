import axios from 'axios';
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';

import s from './strava-segments.css';

class StravaSegments extends Component {
  static get propTypes() {
    return {
      segments: PropTypes.array
    }
  }

  render() {
    const { segments } = this.props;

    let ordered = []
    segments.forEach(s => ordered.splice(0, 0, s));

    const height = segments.length * 42;
    return <div className="strava-segments" ref={c => this.updateContainerHeight(c)}>
        <div className="container">
            <ul>
                { ordered.map(s => this.renderSegment(s)) }
            </ul>
        </div>
    </div>
  }

  updateContainerHeight(container) {
    if (container) {
      const listRect = container.children[0].getBoundingClientRect();
      container.style.height = `${listRect.height}px`;
    }
  }

  renderSegment(segment) {
    const { name, difference } = segment;

    return <li className="segment" key={`segment-${segment.id}`}>
        <span className="name">{name}</span>
        {this.renderDifference(difference)}
      </li>
  }

  renderDifference(difference) {
    let totalSeconds = Math.round(difference);
    const faster = (totalSeconds < 0);
    const slower = (totalSeconds > 0);
    const sign = faster ? '-' : (slower ? '+' : '');
    totalSeconds = Math.abs(totalSeconds);

    const minutes = Math.floor(totalSeconds / 60);
    let secondsStr = (totalSeconds % 60) + '';
    if (secondsStr.length < 2) secondsStr = '0' + secondsStr;

    return <span className={classnames('difference', { slower, faster })}>
        {`${sign}${minutes}:${secondsStr}`}
    </span>
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
)(StravaSegments);
