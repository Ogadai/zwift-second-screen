import React, { Component} from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import s from './infoDetail.css';

class InfoDetail extends Component {
  static get propTypes() {
    return {
      details: PropTypes.shape({
        prompt: PropTypes.string,
        name: PropTypes.string,
        href: PropTypes.string
      })
    }
  }

  render() {
    const { details } = this.props;
    return <div className="info-detail">
      {details.prompt || 'Map by'}
      &nbsp;
      {details.href && <a href={details.href} target="_blank">{details.name}</a>}
      {details.time && <span>{moment(details.time).fromNow()}</span>}
    </div>
  }
}

export default InfoDetail;
