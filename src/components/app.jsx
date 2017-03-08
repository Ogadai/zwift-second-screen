import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';

import CookieWarning from './cookie-warning';
import Summary from './summary';
import Map from './map';
import Ghosts from './ghosts';
import Analytics from './analytics';

import { closeApp } from '../actions/host';

import s from './app.css';

class App extends Component {
  static get propTypes() {
    return {
      develop: PropTypes.bool,
      overlay: PropTypes.bool,
      onCloseApp: PropTypes.func
    };
  }

  constructor(props) {
    super(props);

    this.state = {
			hovering: false
    };
  }

  render() {
    const { develop, overlay, onCloseApp } = this.props;
    const { hovering } = this.state;

    return (
      <div className={classnames("zwift-app", { overlay, hovering })}>
        <CookieWarning />
        <h1 className="title-bar">
          ZwiftGPS
					<a className="close-button" href="#" onClick={onCloseApp}>X</a>
				</h1>
        <div className="content" onMouseMove={() => this.onMouseMove()}>
          <Map develop={develop} />
          <Summary />
					<Ghosts />
				</div>
        <Analytics />
        
        <div className="feedback">
          <a href="http://zwiftblog.com/zwiftgps/" target="_blank">Feedback</a>
        </div>
      </div>
    )
  }

  onMouseMove() {
    if (this.mouseMoveTimeout) {
      clearTimeout(this.mouseMoveTimeout);
    }

    this.setState({
			hovering: true
    });
    this.mouseMoveTimeout = setTimeout(() => {
      this.setState({
        hovering: false
      });
      this.mouseMoveTimeout = null;
    }, 3000);
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    develop: ownProps.params.filter === 'dev',
    overlay: state.environment.electron
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    onCloseApp: closeApp
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
