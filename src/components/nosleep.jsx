import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';
import NoSleep from 'nosleep.js';

import s from './nosleep.css';

class NoSleepButton extends Component {

  constructor(props) {
    super(props);
    this.noSleep = new NoSleep();

    this.state = {
      active: false
    };
  }

  onToggleSleep() {
    const { active } = this.state;

    if (active) {
      this.noSleep.disable();
    } else {
      this.noSleep.enable();
    }

    this.setState({
      active: !active
    });
  }

  render() {
    const { active } = this.state;

return <div className="nosleep">
      <button className={classnames('app-button', 'menu-button', { disabled: !active })} onClick={() => { this.onToggleSleep(); }}>
        <span className="zwiftgps-icon icon-lockscreen">&nbsp;</span>
      </button>
    </div>
  }
}
export default NoSleepButton;