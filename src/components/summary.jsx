import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';

import { fetchProfile } from '../actions/fetch';
import { requestLoginType } from '../actions/login';
import { setMenuState, showWorldSelector, setWorld, showStravaSettings } from '../actions/summary';
import { connectStrava, disconnectStrava } from '../actions/strava';

import s from './summary.css';

class Summary extends Component {
  static get propTypes() {
    return {
      showingMenu: PropTypes.bool,
      showingWorldSelector: PropTypes.bool,
      profile: PropTypes.object.isRequired,
      user: PropTypes.object,
      mapSettings: PropTypes.object,
      onShowStravaSettings: PropTypes.func,
      showingStravaSettings: PropTypes.bool,
      stravaConnected: PropTypes.bool,
      onSetMenuState: PropTypes.func.isRequired,
      onShowWorldSelector: PropTypes.func.isRequired,
      onSetWorld: PropTypes.func.isRequired,
      onRequestLoginType: PropTypes.func.isRequired,
      onFetch: PropTypes.func.isRequired,
      onConnectStrava: PropTypes.func.isRequired,
      onDisconnectStrava: PropTypes.func.isRequired
    };
  }

  componentDidMount() {
    const { onFetch, onRequestLoginType } = this.props;
    onFetch();
    onRequestLoginType();
    this.fetchInterval = setInterval(onFetch, 10000);
  }

  componentWillUnmount() {
    clearInterval(this.fetchInterval);
  }

  render() {
    const { showingMenu, showingWorldSelector, profile, mapSettings, user,
      showingStravaSettings, stravaConnected, onShowStravaSettings,
      onSetMenuState, onShowWorldSelector, onSetWorld } = this.props;
    const { credit } = mapSettings;
    const disabled = !profile.riding;

    return (
      <div className="summary">
        <button className="app-button menu-button" onClick={() => { onSetMenuState(!showingMenu); }}>
          <span className="zwiftgps-icon icon-menu">&nbsp;</span>
        </button>

        <div className={classnames("menu-overlay", { hide: !showingMenu })}
              onMouseDown={() => onSetMenuState(false)}
              onTouchStart={() => onSetMenuState(false)}
            >
        </div>
        <div className={classnames("menu-content", { hide: !showingMenu })}
              onTouchStart={e => this.onTouchStart(e)}
              onTouchMove={e => this.onTouchMove(e)}
              onTouchEnd={e => this.onTouchEnd(e)}
              onClick={() => onSetMenuState(false)}
          >
          <div className="header">
            <div className={classnames("logo", { disabled })}></div>
            <div className="player-name">
              <span className={classnames("name", { disabled })}>
                {profile.firstName} {profile.lastName}
              </span>
            </div>
          </div>

          <ul className="actions">
            <li>
              <a className="fullScreen" href="#" onClick={e => this.toggleFullScreen(e)}>
                <span className="zwiftgps-icon icon-fullscreen">&nbsp;</span>
                <span>Full Screen</span>
              </a>
            </li>

            { (user && user.canSetWorld)
              ? <li>
                  <a className="world" href="#" onClick={e => this.showWorldSelector(e)}>
                      <span className="zwiftgps-icon icon-setworld">&nbsp;</span>
                      <span>Change World</span>
                  </a>
                </li>
              : undefined }

            { (user && user.canStrava)
              ? <li>
                  <a className="world" href="#" onClick={e => this.showStravaSettings(e)}>
                      <span className="zwiftgps-icon icon-strava">&nbsp;</span>
                      <span>Strava</span>
                  </a>
                </li>
              : undefined }

            { (user && user.canLogout)
              ? <li>
                  <a className="feedback" href="http://zwiftblog.com/zwiftgps/" target="_blank">
                      <span className="zwiftgps-icon icon-feedback">&nbsp;</span>
                      <span>Feedback</span>
                  </a>
                </li>
              : undefined }

            { (user && user.canLogout)
              ? <li>
                  <a className="logout" href="/login">
                    <span className="zwiftgps-icon icon-logout">&nbsp;</span>
                    <span>Logout</span>
                  </a>
                </li>
            : undefined }
          </ul>
        </div>

        {showingWorldSelector ?
          <div>
            <div className="popup-overlay"
                  onMouseDown={() => onShowWorldSelector(false)}
                  onTouchStart={() => onShowWorldSelector(false)}
                >
            </div>
            <div className="popup-content world-selector">
              <h2>Select World</h2>
              <ul>
                <li onClick={() => onSetWorld(1)}>
                  <span className="world-image world-1"></span>
                  <span className="world-name">Watopia</span>
                </li>
                <li onClick={() => onSetWorld(2)}>
                  <span className="world-image world-2"></span>
                  <span className="world-name">Richmond</span>
                </li>
                <li onClick={() => onSetWorld(3)}>
                  <span className="world-image world-3"></span>
                  <span className="world-name">London</span>
                </li>
              </ul>
            </div>
          </div>
        : undefined }

        {showingStravaSettings ?
          <div>
            <div className="popup-overlay"
                  onMouseDown={() => onShowStravaSettings(false)}
                  onTouchStart={() => onShowStravaSettings(false)}
                >
            </div>
            <div className="popup-content strava-settings">
              <h2><span className="zwiftgps-icon icon-strava">&nbsp;</span> Strava Segments</h2>
              <div className="description">
                Live PR comparison for "ZwiftBlog verified" segments
              </div>
              <div className="description">
                Star Strava segments to add them to ZwiftGPS
              </div>
              <div className="popup-footer">
                <a className="button" href="#"
                    onClick={e => this.stravaToggleConnection(e)}
                  >
                    {stravaConnected ? 'Disconnect' : 'Connect'}
                </a>
              </div>
            </div>
          </div>
        : undefined }

        {credit ?
          <div className="map-attribute">
            {credit.prompt || 'Map by'} <a href={credit.href} target="_blank">{credit.name}</a>
          </div>
        : undefined }
      </div>
    )
  }

  onTouchStart(event) {
    this.touchStartTime = new Date();
    this.touchStart = event.touches && event.touches.length
        ? event.touches[0]
        : null;
  }
  onTouchMove(event) {
    this.touchMove = event.touches && event.touches.length
        ? event.touches[0]
        : null;
  }
	onTouchEnd(event) {
    const { onSetMenuState } = this.props;
    if (this.touchStart && this.touchMove) {
      const distanceX = Math.abs(this.touchStart.clientX - this.touchMove.clientX),
            distanceY = Math.abs(this.touchStart.clientY - this.touchMove.clientY),
            time = new Date() - this.touchStartTime;
      if (distanceX > 50 && distanceX > 3 * distanceY && time < 300){
        onSetMenuState(false);
      }
    }
  }

  toggleFullScreen(event) {
    event.preventDefault();
    var doc = window.document;
    var docEl = doc.documentElement;

    var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
    var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

    try {
        if(!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
            requestFullScreen.call(docEl);
        }
        else {
            cancelFullScreen.call(doc);
        }
    } catch(ex) {
        console.log(`error trying to toggle full screen - ${ex.message}`);
    }
  }

  showWorldSelector(event) {
    const { onShowWorldSelector } = this.props;
    event.preventDefault();
    onShowWorldSelector(true);
  }

  showStravaSettings(event) {
    const { onShowStravaSettings } = this.props;
    event.preventDefault();
    onShowStravaSettings(true);
  }

  stravaToggleConnection(event) {
    const { stravaConnected, onDisconnectStrava, onConnectStrava } = this.props;
    event.preventDefault();

    if (stravaConnected) {
      onDisconnectStrava();
    } else {
      onConnectStrava();
    }
  }
}

const mapStateToProps = (state) => {
  return {
    showingMenu: state.summary.showingMenu,
    showingWorldSelector: state.summary.worldSelector,
    profile: state.profile,
		user: state.login.user,
    mapSettings: state.mapSettings,
    showingStravaSettings: state.summary.stravaSettings,
    stravaConnected: state.world.strava ? state.world.strava.connected : false
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    onSetMenuState: showMenu => dispatch(setMenuState(showMenu)),
    onShowWorldSelector: showSelector => dispatch(showWorldSelector(showSelector)),
    onSetWorld: worldId => dispatch(setWorld(worldId)),
    onShowStravaSettings: showStrava => dispatch(showStravaSettings(showStrava)),
    onRequestLoginType: () => dispatch(requestLoginType()),
    onFetch: () => dispatch(fetchProfile()),
    onConnectStrava: () => dispatch(connectStrava()),
    onDisconnectStrava: () => dispatch(disconnectStrava())
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Summary);
