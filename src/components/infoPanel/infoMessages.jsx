import React, { Component} from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import getName from './getName';
import s from './infoMessages.css';

class InfoMessages extends Component {
  static get propTypes() {
    return {
      messages: PropTypes.shape({
        type: PropTypes.string,
        list: PropTypes.array
      }).isRequired
    }
  }

  render() {
    const { messages } = this.props;
    const { type, list } = messages;

    return <ul className={classnames('info-messages', type)}>
      {list.map((message, index) => this.renderMessage(message, index))}
    </ul>
  }

  renderMessage(message, index) {
    const { id, rider, text } = message;
    return <li key={`msg-${id || index}`}>
      <div className="info-messages-content">
        {rider && <span className="info-messages-name">{getName(rider)}</span>}
        <span className="info-messages-text">{text}</span>
      </div>
    </li>;
  }
}

export default InfoMessages;
