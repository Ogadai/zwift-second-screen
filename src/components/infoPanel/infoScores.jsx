import React, { Component} from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import getName from './getName';
import s from './infoScores.css';

class InfoScores extends Component {
  static get propTypes() {
    return {
      profile: PropTypes.object,
      scores: PropTypes.array
    }
  }

  render() {
    const { scores } = this.props;
    if (scores.length == 0) {
      return <div className="info-scores-empty">Collect coins to score points</div>;
    }
    else if (!scores[0].rider) {
      return this.renderTeams(scores, Math.floor(10 / scores.length));
    } else {
      return <div className="info-scores">
       {this.renderScores(scores, 10)}
      </div>;
    }
  }

  renderTeams(teams, limit) {
    return <div className="info-scores">
      {teams.map(team =>
        <div className="info-scores-team" key={team.name}>
          <h4 className={`info-scores-${team.colour}`}>
            <span className="info-scores-name">{team.name}</span>
            <span className="info-scores-score">{team.score}</span>
          </h4>
          {this.renderScores(team.scores, limit)}
        </div>)}
    </div>;
  }

  renderScores(scores, limit) {
    const rendered = [];
    const includesMe = scores.find(entry => entry.rider.me);

    scores.forEach((entry, index) => {
      if (index < limit || !includesMe || entry.rider.me) {
        rendered.push(Object.assign({ position: index + 1 }, entry));
      }
    });

    return <ul style={{ height: rendered.length * 30 }}>
      {rendered.map((entry, index) => this.renderScore(entry, index))}
    </ul>
  }

  renderScore(entry, index) {
    const { profile } = this.props;
    const { position, score, rider } = entry;
    return <li className={classnames({ me: rider.id === profile.id })} key={`rider-${rider.id}`} style={{ top: index * 30 }}>
      <span className="info-scores-position">{position}</span>
      <span className="info-scores-name">{getName(rider)}</span>
      <span className="info-scores-score">{score}</span>
    </li>;
  }
}

export default InfoScores;
