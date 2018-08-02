import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classnames from 'classnames';
import moment from 'moment';

import { fetchProfile, fetchEvents } from '../actions/fetch';
import { requestLoginType } from '../actions/login';
import { setMenuState, showWorldSelector, setWorld, showStravaSettings, showRiderFilter, setRiderFilter, showGameSelector } from '../actions/summary';
import { connectStrava, disconnectStrava, saveStravaSettings } from '../actions/strava';
import { toggleFullScreen } from './full-screen';

import s from './summary.css';

const EVENT_PREFIX = "event:";

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
      stravaSettings: PropTypes.any.isRequired,
      showingRiderFilter: PropTypes.bool,
      showingGameSelector: PropTypes.bool,
      events: PropTypes.array,
      currentEvent: PropTypes.object,
      eventsFetching: PropTypes.bool,
      riderFilterEvent: PropTypes.string,
      eventName: PropTypes.string,
      whatsNew: PropTypes.object,
      onSetMenuState: PropTypes.func.isRequired,
      onShowWorldSelector: PropTypes.func.isRequired,
      onSetWorld: PropTypes.func.isRequired,
      onRequestLoginType: PropTypes.func.isRequired,
      onFetch: PropTypes.func.isRequired,
      onConnectStrava: PropTypes.func.isRequired,
      onDisconnectStrava: PropTypes.func.isRequired,
      onSaveStravaSettings: PropTypes.func.isRequired,
      onShowRiderFilter: PropTypes.func.isRequired,
      onSetRiderFilter: PropTypes.func.isRequired,
      onShowGameSelector: PropTypes.func.isRequired
    };
  }

  constructor(props) {
    super();

    this.state = {
      stravaAgeValid: true,
      stravaDateValid: true,
      stravaSettings: props.stravaSettings
    }
  }

  componentWillReceiveProps(props) {
    this.setState({
      stravaAgeValid: true,
      stravaDateValid: true,
      stravaSettings: props.stravaSettings
    });
  }

  componentDidMount() {
    const { onFetch, onRequestLoginType } = this.props;
    onFetch();
    onRequestLoginType();
    this.fetchInterval = setInterval(onFetch, 30000);
  }

  componentWillUnmount() {
    clearInterval(this.fetchInterval);
  }

  render() {
    const { showingMenu, showingWorldSelector, profile, mapSettings, user,
      events, currentEvent, eventsFetching, eventName, riderFilterEvent, whatsNew,
      showingGameSelector, showingStravaSettings, stravaConnected, onShowStravaSettings,
      showingRiderFilter, onShowRiderFilter, onShowGameSelector,
      onSetMenuState, onShowWorldSelector, onSetWorld, onSaveStravaSettings } = this.props;
    const { stravaAgeValid, stravaSettings } = this.state;
    const { credit } = mapSettings;
    const disabled = !profile.riding;

    const newFeature = !!Object.keys(whatsNew).find(k => !whatsNew[k]);
    // And for links:
    // <a className={classnames('gameSelector', { newFeature: !whatsNew.games })}

    return (
      <div className="summary">
        <button
              className={classnames('app-button', 'menu-button')}
              onClick={() => { onSetMenuState(!showingMenu); }}>
          <span className="zwiftgps-icon icon-menu">&nbsp;</span>
        </button>
        {newFeature && <div className="menu-button-new newFeature">&nbsp;</div>}
        {riderFilterEvent && <div className="summary-filtered-event">
          <span className="event-name">{riderFilterEvent}</span>
          <button className="cancel-event" onClick={() => this.setFilterType(0)}>
            <span className="zwiftgps-icon icon-minimize">&nbsp;</span>
          </button>
        </div>}

        {currentEvent && !riderFilterEvent && !eventName && <ul className="summary-quick-links">
          {this.renderEventDetail(currentEvent)}
        </ul>}

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

            { (user && user.canFilterRiders && !eventName)
              ? <li>
                  <a className="riderFilter" href="#" onClick={e => this.showRiderFilter(e)}>
                    <span className="zwiftgps-icon icon-riderfilter">&nbsp;</span>
                    <span>Events</span>
                  </a>
                </li>
              : undefined }

            { (user && user.canSetWorld)
              ? <li>
                  <a className="world" href="#" onClick={e => this.showWorldSelector(e)}>
                      <span className="zwiftgps-icon icon-setworld">&nbsp;</span>
                      <span>Change World</span>
                  </a>
                </li>
              : undefined }

            { (user && user.canStrava && !profile.anonymous)
              ? <li>
                  <a className="world" href="#" onClick={e => this.showStravaSettings(e)}>
                      <span className="zwiftgps-icon icon-strava">&nbsp;</span>
                      <span>Strava</span>
                  </a>
                </li>
              : undefined }

            { (user && user.canLogout)
              ? <li>
                  <a className="gameSelector" href="#" onClick={e => this.showGameSelector(e)}>
                    <span className="zwiftgps-icon icon-gameselector">&nbsp;</span>
                    <span>Games</span>
                  </a>
                </li>
              : undefined }

            { (user && user.canLogout)
              ? <li>
                  <a className="feedback" href="http://zwiftblog.com/zwiftgps/" target="_blank" rel="noopener">
                      <span className="zwiftgps-icon icon-feedback">&nbsp;</span>
                      <span>Feedback</span>
                  </a>
                </li>
              : undefined }

            { (user && user.canLogout)
              ? <li>
                  <a className="logout" href={eventName ? `/login/${eventName}` : '/login'}>
                    <span className={classnames('zwiftgps-icon', profile.anonymous ? 'icon-login' : 'icon-logout')}>&nbsp;</span>
                    <span>{profile.anonymous ? 'Login' : 'Logout'}</span>
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
                <li onClick={() => onSetWorld(5)}>
                  <span className="world-image world-5"></span>
                  <span className="world-name">Innsbruck</span>
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
              <div className="connection-buttons">
                <a className="button" href="#"
                    onClick={e => this.stravaToggleConnection(e)}
                  >
                    {stravaConnected ? 'Disconnect' : 'Connect'}
                </a>
              </div>
              <div className="strava-config-startdate">
                <h3>Lookup Strava Personal Records for</h3>
                <ul>
                  <li>
                    <input type="radio" name="startdate" id="stravaStartNone"
                        checked={!stravaSettings.startAge && !stravaSettings.startDate}
                        onChange={() => onSaveStravaSettings({})} />
                    <label htmlFor="stravaStartNone">all time</label>
                  </li>
                  <li>
                    <input type="radio" name="startdate" id="stravaStartAge"
                        checked={stravaSettings.startAge !== undefined}
                        onChange={() => onSaveStravaSettings({ startAge: 90 })} />
                    <label htmlFor="stravaStartAge">last
                      <input type="text" value={stravaSettings.startAge !== undefined ? stravaSettings.startAge : 90}
                          className={classnames("age", { error: !stravaAgeValid })}
                          onChange={event => this.stravaSettingsAge(event)}
                        />
                    days</label>
                  </li>
                  <li>
                    <input type="radio" name="startdate" id="stravaStartDate"
                        checked={stravaSettings.startDate}
                        onChange={() => onSaveStravaSettings({startDate: '2017-01-01T00:00:00Z'})} />
                    <label htmlFor="stravaStartDate">since 1st Jan 2017</label>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        : undefined }

        {showingRiderFilter ?
          <div>
            <div className="popup-overlay"
                  onMouseDown={() => onShowRiderFilter(false)}
                  onTouchStart={() => onShowRiderFilter(false)}
                >
            </div>
            <div className="popup-content rider-filter">
              <h2>Events</h2>
                <ul>
                  <li className="event-item" onClick={() => this.setFilterType(0)}>
                    <div className="event-free">
                      <span className="event-name">Free ride</span>
                    </div>
                  </li>
                  {events && events.slice().reverse().map(e => this.renderEventDetail(e))}
              </ul>
              {eventsFetching && <div>Loading...</div>}
            </div>
          </div>
        : undefined }


        {showingGameSelector ?
          <div>
            <div className="popup-overlay"
                  onMouseDown={() => onShowGameSelector(false)}
                  onTouchStart={() => onShowGameSelector(false)}
                >
            </div>
            <div className="popup-content game-selector">
            <h2>ZwiftGPS Games</h2>
              <ul>
                <li onClick={() => this.onSelectGame('')}>
                  <span className="game-image game-zwiftgps"></span>
                  <span className="game-name">ZwiftGPS</span>
                </li>
                <li onClick={() => this.onSelectGame('zwiftquest')}>
                  <span className="game-image game-zwiftquest"></span>
                  <span className="game-name">ZwiftQuest</span>
                </li>
                <li onClick={() => this.onSelectGame('goldrush')}>
                  <span className="game-image game-goldrush"></span>
                  <span className="game-name">GoldRush</span>
                </li>
              </ul>
            </div>
          </div>
        : undefined }

        {credit ?
          <div className="map-attribute">
            {credit.prompt || 'Map by'} <a href={credit.href} target="_blank" rel="noopener">{credit.name}</a>
          </div>
        : undefined }
      </div>
    )
  }

  renderEventDetail(e) {
    return (
      <li key={`event-${e.id}`}
        onClick={() => this.setFilterType(2, `${EVENT_PREFIX}${e.id}`)}
        className="event-item"
        style={{ backgroundImage: e.imageUrl ? `url(${e.imageUrl})` : '' }}
      >
      <div className="event-content">
        <div className="event-line">
          <span className="event-time">{moment(e.eventStart).format('LT')}</span>
          <span className="event-name">{e.name}</span>
        </div>
        <div className="event-line">
          {e.eventSubgroups && e.eventSubgroups.map(g => 
            <span key={`event-grp-${g.id}`} className={classnames('group', `group-${g.label}`)}>{g.totalEntrantCount}</span>
          )}
        </div>
      </div>
    </li>);
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
    toggleFullScreen();
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

  stravaSettingsAge(event) {
    const { onSaveStravaSettings } = this.props;
    const startAge = parseInt(event.target.value);

    this.setState( {
      stravaAgeValid: startAge > 0,
      stravaSettings: {
        startAge: event.target.value
      }
    });

    if (startAge > 0) {
      onSaveStravaSettings({ startAge });
    }
  }

  setFilterType(filterType, riderFilter) {
    const { onSetRiderFilter } = this.props;
    onSetRiderFilter((filterType !== 0) ? riderFilter : '');
  }

  showRiderFilter(event) {
    const { onShowRiderFilter, onGetEvents } = this.props;
    event.preventDefault();
    onShowRiderFilter(true);
    onGetEvents();
  }

  showGameSelector(event) {
    const { onShowGameSelector } = this.props;
    event.preventDefault();
    onShowGameSelector(true);
  }

  onSelectGame(game) {
    const { onShowGameSelector } = this.props;
    onShowGameSelector(false);
    window.location = `/${game}`;
  }
}

const mapStateToProps = (state) => {
  return {
    showingMenu: state.summary.showingMenu,
    showingWorldSelector: state.summary.worldSelector,
    profile: state.profile,
		user: state.login.user,
    mapSettings: state.mapSettings,
    showingStravaSettings: state.summary.showStravaSettings,
    stravaConnected: state.world.strava ? state.world.strava.connected : false,
    stravaSettings: state.summary.stravaSettings,
    showingRiderFilter: state.summary.showRiderFilter,
    showingGameSelector: state.summary.showGameSelector,
    eventName: state.summary.eventName,
    riderFilterEvent: state.summary.riderFilterEvent,
    events: state.summary.events,
    eventsFetching: state.summary.eventsFetching,
    whatsNew: state.summary.whatsNew,
    currentEvent: state.world.currentEvent
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
    onDisconnectStrava: () => dispatch(disconnectStrava()),
    onSaveStravaSettings: (settings) => dispatch(saveStravaettings(settings)),
    onShowRiderFilter: show => dispatch(showRiderFilter(show)),
    onShowGameSelector: show => dispatch(showGameSelector(show)),
    onSetRiderFilter: filter => dispatch(setRiderFilter(filter)),
    onGetEvents: () => dispatch(fetchEvents())
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Summary);
