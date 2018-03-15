import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classnames from 'classnames';
import moment from 'moment';

import { fetchProfile, fetchRiderFilterIfNeeded, fetchEvents } from '../actions/fetch';
import { requestLoginType } from '../actions/login';
import { setMenuState, showWorldSelector, setWorld, showStravaSettings, showRiderFilter, setRiderFilter, showGameSelector } from '../actions/summary';
import { connectStrava, disconnectStrava, saveStravaSettings } from '../actions/strava';
import { toggleFullScreen } from './full-screen';

import s from './summary.css';

const EVENT_PREFIX = "event:";

const filterTypeFromFilter = riderFilter => {
  if (riderFilter && riderFilter.length > 0) {
    if (riderFilter.indexOf(EVENT_PREFIX) === 0) {
      return isNaN(riderFilter.substring(EVENT_PREFIX.length)) ? 1 : 2;
    }
    return 1;
  }
  return 0;
}

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
      riderFilter: PropTypes.string,
      events: PropTypes.array,
      whatsNew: PropTypes.object,
      onSetMenuState: PropTypes.func.isRequired,
      onShowWorldSelector: PropTypes.func.isRequired,
      onSetWorld: PropTypes.func.isRequired,
      onRequestLoginType: PropTypes.func.isRequired,
      onFetch: PropTypes.func.isRequired,
      onConnectStrava: PropTypes.func.isRequired,
      onDisconnectStrava: PropTypes.func.isRequired,
      onSaveStravaSettings: PropTypes.func.isRequired,
      onFetchRiderFilter: PropTypes.func.isRequired,
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
      stravaSettings: props.stravaSettings,
      filterType: filterTypeFromFilter(props.riderFilter),
      riderFilter: props.riderFilter
    }
  }

  componentWillReceiveProps(props) {
    const updatedFilter = !this.state.filterType || props.riderFilter !== this.props.riderFilter;
    this.setState({
      stravaAgeValid: true,
      stravaDateValid: true,
      stravaSettings: props.stravaSettings,
      filterType: updatedFilter ? filterTypeFromFilter(props.riderFilter) : this.state.filterType,
      riderFilter: updatedFilter ? props.riderFilter : this.state.riderFilter
    });
  }

  componentDidMount() {
    const { onFetch, onRequestLoginType, onFetchRiderFilter } = this.props;
    onFetch();
//    onFetchRiderFilter();
    onRequestLoginType();
    this.fetchInterval = setInterval(onFetch, 30000);
  }

  componentWillUnmount() {
    clearInterval(this.fetchInterval);
  }

  render() {
    const { showingMenu, showingWorldSelector, profile, mapSettings, user, events, eventName, whatsNew,
      showingGameSelector, showingStravaSettings, stravaConnected, onShowStravaSettings,
      showingRiderFilter, onShowRiderFilter, onSetRiderFilter, onShowGameSelector,
      onSetMenuState, onShowWorldSelector, onSetWorld, onSaveStravaSettings } = this.props;
    const { stravaAgeValid, stravaDateValid, stravaSettings, filterType, riderFilter } = this.state;
    const { credit } = mapSettings;
    const disabled = !profile.riding;

    const newFeature = !!Object.keys(whatsNew).find(k => !whatsNew[k]);

    return (
      <div className="summary">
        <button
              className={classnames('app-button', 'menu-button')}
              onClick={() => { onSetMenuState(!showingMenu); }}>
          <span className="zwiftgps-icon icon-menu">&nbsp;</span>
        </button>
        {newFeature && <div className="menu-button-new newFeature">&nbsp;</div>}

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

            { (user && user.canFilterRiders)
              ? <li>
                  <a className="riderFilter" href="#" onClick={e => this.showRiderFilter(e)}>
                    <span className="zwiftgps-icon icon-riderfilter">&nbsp;</span>
                    <span>Find riders</span>
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
                  <a className={classnames('gameSelector', { newFeature: !whatsNew.games })} href="#" onClick={e => this.showGameSelector(e)}>
                    <span className="zwiftgps-icon icon-gameselector">&nbsp;</span>
                    <span>Games</span>
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
              <h2>Find riders</h2>
              <form onSubmit={event => this.applyRiderFilter(event)}>
                <ul>
                  {(!profile.anonymous) && <li>
                      <input type="radio" name="filternone" id="filternone"
                          checked={filterType === 0}
                          onChange={() => this.setFilterType(0)} />
                      <label htmlFor="filternone">Myself and friends</label>
                    </li>
                  }
                  <li>
                    <input type="radio" name="filterset" id="filterset"
                        checked={filterType === 1}
                        onChange={() => this.setFilterType(1)} />
                    <label htmlFor="filterset">Where
                      <input type="text" value={filterType === 1 ? riderFilter : ''}
                            className={classnames("riderfilter")}
                            onChange={event => this.updateRiderFilter(event)}
                          />
                    is in last name</label>
                  </li>
                  {events &&
                    <li>
                      <input type="radio" name="filterevent" id="filterevent"
                          checked={filterType === 2}
                          onChange={() => this.setFilterType(2)} />
                      <label htmlFor="filterevent">Event
                        <select
                          value={filterType === 2 ? riderFilter : ''}
                          onChange={event => this.updateRiderFilter(event)}
                          className={classnames("eventfilter")}
                        >
                          <option value=""></option>
                          {events.map(e => <option
                                key={e.id}
                                value={`${EVENT_PREFIX}${e.id}`}
                              >{`${moment(e.eventStart).format('LT')} - ${e.name}`}</option>)}
                        </select>
                      </label>
                    </li>
                  }
                </ul>
                <div className="filter-buttons">
                  <input type="submit" value="Search" />
                </div>
              </form>
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

  setFilterType(filterType) {
    this.setState({
      filterType
    });
  }

  updateRiderFilter(event) {
    const riderFilter = event.target.value;
    this.setState({
      filterType: filterTypeFromFilter(riderFilter),
      riderFilter
    });
  }

  applyRiderFilter(event) {
    const { onSetRiderFilter } = this.props;
    const { filterType, riderFilter } = this.state;

    event.preventDefault();

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
    riderFilter: state.summary.riderFilter,
    eventName: state.summary.eventName,
    events: state.summary.events,
    whatsNew: state.summary.whatsNew
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
    onFetchRiderFilter: () => dispatch(fetchRiderFilterIfNeeded()),
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
