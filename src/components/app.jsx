import React, { Component, PropTypes } from 'react';
import Summary from './summary';
import FanSpeed from './fan-speed';

export default class App extends Component {
  render() {
    return (
      <div className="zwift-app">
        <FanSpeed />
        <Summary />
      </div>
    )
  }
}
