import React, { Component, PropTypes } from 'react';
import Summary from './summary';
import Map from './map';

import s from './app.css';

export default class App extends Component {
  render() {
    return (
      <div className="zwift-app">
        <Summary />
        <Map />
      </div>
    )
  }
}
