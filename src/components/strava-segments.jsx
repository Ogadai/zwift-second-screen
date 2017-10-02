import axios from 'axios';
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';

import s from './strava-segments.css';

class StravaSegments extends Component {
  static get propTypes() {
    return {
      connected: PropTypes.bool,
      segments: PropTypes.array
    }
  }

  render() {
    const { connected, segments } = this.props;

    let ordered = []
    segments.forEach(s => ordered.splice(0, 0, s));

    const height = segments.length * 42;
    return <div className="strava-segments" ref={c => this.updateContainerHeight(c)}>
      { connected ?
        <div className="container">
            { ordered.length > 0 ? <ul>
                  { ordered.map(s => this.renderSegment(s)) }
              </ul>
            : <div className="strava-connected"><span className="anim"></span></div> }
        </div>
      : undefined }
    </div>
  }

  updateContainerHeight(container) {
    if (container && container.children.length > 0) {
      const listRect = container.children[0].getBoundingClientRect();
      container.style.height = `${listRect.height}px`;
    }
  }

  renderSegment(segment) {
    const { name, difference } = segment;
    let diffSeconds = Math.round(difference);

    return <li className={classnames('segment', { slower: diffSeconds > 0, faster: diffSeconds < 0 })}
        key={`segment-${segment.id}`}>
        <span className="name">{name}</span>
        {this.renderDifference(difference)}
        {this.renderTime(segment)}
      </li>
  }

  renderDifference(difference) {
    let totalSeconds = Math.round(difference);
    const sign = (totalSeconds < 0) ? '-' : ((totalSeconds > 0) ? '+' : '');
    totalSeconds = Math.abs(totalSeconds);

    return <span className="difference">
        {`${sign}${this.secondsToTime(totalSeconds)}`}
    </span>
  }

  renderTime(segment) {
    const timeNow = new Date();
    const timeStart = new Date(Date.parse(segment.startTime));
    const elapsed = Math.round((timeNow.getTime() - timeStart.getTime()) / 1000);

    return <span className="time">(
      <span className="elapsed">{this.secondsToTime(elapsed)}</span>
      /
      <span className="pr">{this.secondsToTime(segment.pr.time)}</span>
    )</span>
  }

  secondsToTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    let secondsStr = (seconds % 60) + '';
    if (secondsStr.length < 2) secondsStr = '0' + secondsStr;
    return `${minutes}:${secondsStr}`;
  }
}

const mapStateToProps = (state) => {
  return {
    connected: (state.world.strava ? state.world.strava.connected : false) || false,
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
