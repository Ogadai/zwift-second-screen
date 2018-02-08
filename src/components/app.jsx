import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';

import CookieWarning from './cookie-warning';
import Summary from './summary';
import Map from './map';
import Ghosts from './ghosts';
import InfoPanel from './infoPanel';
import StravaSegments from './strava-segments';
import Analytics from './analytics';
import Zoom from './zoom';

import { closeApp } from '../actions/host';
import { setZoomLevel } from '../actions/summary';

import s from './app.css';

const mapZoomLevels = {
  1: 2.5,
  2: 1,
  3: 1
};

class App extends Component {
  static get propTypes() {
    return {
			worldId: PropTypes.number,
      develop: PropTypes.bool,
      overlay: PropTypes.bool,
      openfin: PropTypes.bool,
      onCloseApp: PropTypes.func
    };
  }

  constructor(props) {
    super(props);

    this.state = {
			hovering: false
    };
  }

  componentWillUnmount() {
    if (this.mouseMoveTimeout) {
      clearTimeout(this.mouseMoveTimeout);
    }
  }

  render() {
    const { worldId, develop, overlay, openfin, onCloseApp, onSetZoomLevel } = this.props;
    const { hovering } = this.state;

    return (
      <div className={classnames("zwift-app", { overlay, openfin, hovering })}>
        <CookieWarning />
        <h1 className="title-bar">
          {document.title}
					<a className="close-button" href="#" onClick={onCloseApp}>X</a>
				</h1>
        <div className="content" onMouseMove={() => this.onMouseMove()}>
          {!develop
          ? <Zoom
                followSelector=".rider-position circle"
                defaultZoom={mapZoomLevels[worldId] || 1}
                onChangeZoomLevel={onSetZoomLevel}
              >
              <Map />
            </Zoom>
          : <Map develop={develop} /> }
          <Summary />
          <InfoPanel />
					<Ghosts />
          <StravaSegments />
				</div>
        <Analytics />
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
    worldId: state.world.worldId,
    develop: ownProps.params.filter === 'dev',
    overlay: state.environment.electron || state.environment.openfin,
    openfin: state.environment.openfin
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    onCloseApp: closeApp,
    onSetZoomLevel: level => dispatch(setZoomLevel(level))
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
