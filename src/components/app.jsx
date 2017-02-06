import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import Summary from './summary';
import Map from './map';

import s from './app.css';

class App extends Component {
  static get propTypes() {
    return {
      overlay: PropTypes.bool
    };
  }

  render() {
    const { overlay } = this.props;

    return (
      <div className="zwift-app">
        <Summary />
        <Map />
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  const { filter } = ownProps.params;
  return {
    overlay: filter && (filter.toLowerCase() === 'overlay')
  }
}

const mapDispatchToProps = (dispatch) => {
  return {

  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
