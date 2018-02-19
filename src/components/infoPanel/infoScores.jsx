import React, { Component} from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import s from './infoScores.css';

class InfoScores extends Component {
  static get propTypes() {
    return {
      scores: PropTypes.array
    }
  }

  render() {
    const { scores } = this.props;
    const rendered = [];
    scores.forEach((entry, index) => {
      if (index < 9 || entry.rider.me) {
        rendered.push(Object.assign({ position: index + 1 }, entry));
      }
    });

    if (scores.length == 0) {
      return <div className="info-scores-empty">Collect coins to score points</div>
    } else {
      return <ul className="info-scores">
        {rendered.map((entry, index) => this.renderScore(entry, index))}
      </ul>
    }
  }

  renderScore(entry, index) {
    const { position, score, rider } = entry;
    return <li className={classnames({ me: rider.me })} key={`rider-${rider.id}`} style={{ top: index * 30 }}>
      <span className="info-scores-position">{position}</span>
      <span className="info-scores-name">{this.getName(rider)}</span>
      <span className="info-scores-score">{score}</span>
    </li>;
  }

  getName(rider) {
    const { firstName, lastName } = rider;
    const displayFirstName = (firstName && lastName.length > 3)
          ? firstName.substring(0, 1)
          : (firstName || '');

    return `${displayFirstName} ${lastName}`.trim();
  }
}

export default InfoScores;
