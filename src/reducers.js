import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'

import { RECEIVE_PROFILE, RECEIVE_POSITIONS, RECEIVE_WORLD, RECEIVE_STRAVA, RECEIVE_MAPSETTINGS, RECEIVE_RIDERS, RECEIVE_STRAVA_EFFORT, RECEIVE_RIDERFILTER, RECEIVE_EVENTS } from './actions/fetch';
import { RECEIVE_LOGINTYPE, RECEIVE_LOGINFAILURE } from './actions/login';
import { RECEIVE_HOST } from './actions/host';
import {
  TOGGLE_GHOSTS, TOGGLE_ADDGHOST, CHANGED_RIDER, RECEIVE_ACTIVITIES, CHANGED_ACTIVITY,
  RECEIVE_GHOSTS, ADDING_GHOST, ADDED_GHOST, CHANGED_GHOST,
  REQUESTING_REGROUP, RECEIVE_REGROUP, RECEIVE_ACTIVITY, RESET_GHOSTS
} from './actions/ghosts';
import { SET_MENU_STATE, SHOW_WORLD_SELECTOR, SHOW_STRAVA_SETTINGS, SHOW_RIDER_FILTER, SET_RIDER_FILTER, SET_ZOOM_LEVEL, TOGGLE_INFOPANEL, SET_EVENT_NAME } from './actions/summary';
import { DISCONNECTED_STRAVA, GOT_STRAVA_SETTINGS } from './actions/strava';

import { COOKIE_WARNING } from './actions/cookie-warning'

const screenSize = {
  width: window.innerWidth,
  height: window.innerHeight
};

function world(state = { positions: [], strava: { connected: false } }, action) {
  switch (action.type) {
    case RECEIVE_WORLD:
      const { worldId, positions, strava, points } = action.data;

      const newState = { worldId };
      if (positions) newState.positions = positions;
      if (strava) newState.strava = strava;
      if (points) newState.points = points;

      return Object.assign({}, state, newState);
    case RECEIVE_POSITIONS:
      return Object.assign({}, state, {
        positions: action.data
      });
    case RECEIVE_STRAVA:
      return Object.assign({}, state, {
        strava: action.data
      });
    case DISCONNECTED_STRAVA:
      return Object.assign({}, state, {
        strava: { connected: false }
      });
  default:
    return state;
  }
}

function login(state = {}, action) {
  switch (action.type) {
    case RECEIVE_LOGINFAILURE:
      return Object.assign({}, state, {
        error: action.data
      })
    case RECEIVE_LOGINTYPE:
      return Object.assign({}, state, {
        user: action.data
      })
    default:
      return state;
  }
}

const defaultEnv = {
    electron: navigator.userAgent.toLowerCase().indexOf('electron') !== -1,
    openfin: !!window.fin,
    analytics: (window.ga && window.ga.trackingId) ? { trackingId: window.ga.trackingId } : {},
    cookieWarning: false
}

function environment(state = defaultEnv, action) {
  switch (action.type) {
    case COOKIE_WARNING:
      return Object.assign({}, state, {
        cookieWarning: action.value
      })
    default:
      return state;
  }
}

const defaultGhosts = {
	ghosts: [],
  showButton: false,
  show: false,
  addingGhost: false,
  riderId: null,
	loadingActivities: false,
  activities: [],
  activityId: null,
  waitingAddGhost: false,
  ghostId: null,
	requestingRegroup: false,
  displayActivity: null
}

function ghosts(state = defaultGhosts, action) {
  switch (action.type) {
    case RECEIVE_GHOSTS:
      return Object.assign({}, state, {
        ghosts: action.data,
        showButton: action.showButton
      });
    case TOGGLE_GHOSTS:
      return Object.assign({}, state, {
				show: !state.show,
        activityId: null,
        ghostId: null,
        displayActivity: null
      });
    case TOGGLE_INFOPANEL:
      return Object.assign({}, state, {
        show: false,
        activityId: null,
        ghostId: null,
        displayActivity: null
      });
    case TOGGLE_ADDGHOST:
      return Object.assign({}, state, {
        addingGhost: !state.addingGhost,
        activityId: null,
        ghostId: null,
        displayActivity: null
      });
    case CHANGED_RIDER:
      return Object.assign({}, state, {
        riderId: action.riderId,
        loadingActivities: true,
        activities: [],
        activityId: null
      });
		case RECEIVE_ACTIVITIES:
      return Object.assign({}, state, {
        loadingActivities: false,
        activities: action.data
      });
    case CHANGED_ACTIVITY:
      return Object.assign({}, state, {
				activityId: action.activityId,
        displayActivity: null
      });
    case ADDING_GHOST:
      return Object.assign({}, state, {
        waitingAddGhost: true
      });
    case ADDED_GHOST:
      return Object.assign({}, state, {
        waitingAddGhost: false,
        addingGhost: false,
        activityId: null,
        ghostId: null,
        displayActivity: null
      });
    case CHANGED_GHOST:
      return Object.assign({}, state, {
        ghostId: action.ghostId,
        displayActivity: null
      });
    case REQUESTING_REGROUP:
      return Object.assign({}, state, {
        requestingRegroup: true
      });
		case RECEIVE_REGROUP:
      return Object.assign({}, state, {
        requestingRegroup: false
      });
    case RECEIVE_ACTIVITY:
      return Object.assign({}, state, {
        displayActivity: action.data
      });
    case RESET_GHOSTS:
      return Object.assign({}, state, {
        ghosts: [],
        show: false,
        addingGhost: false,
        riderId: null,
        loadingActivities: false,
        activities: [],
        activityId: null,
        ghostId: null,
        displayActivity: null
      });
    default:
      return state;
  }
}

const defaultSummary = {
  showingMenu: false,
  worldSelector: false,
  showStravaSettings: false,
  showRiderFilter: false,
  stravaSettings: {},
  riderFilter: undefined,
  events: [],
  zoomLevel: 1,
  showInfoPanel: screenSize.width >= 900,
  eventName: undefined
}

function summary(state = defaultSummary, action) {
  switch (action.type) {
    case SET_MENU_STATE:
      return Object.assign({}, state, {
        showingMenu: action.visible
      });
    case SHOW_WORLD_SELECTOR:
      return Object.assign({}, state, {
        worldSelector: action.visible
      });
    case SHOW_STRAVA_SETTINGS:
      return Object.assign({}, state, {
        showStravaSettings: action.visible
      });
    case SHOW_RIDER_FILTER:
      return Object.assign({}, state, {
        showRiderFilter: action.visible
      });
    case RECEIVE_RIDERFILTER:
      return Object.assign({}, state, {
        riderFilter: action.filter
      });
    case SET_RIDER_FILTER:
      return Object.assign({}, state, {
        riderFilter: action.filter
      });
    case DISCONNECTED_STRAVA:
      return Object.assign({}, state, {
        showStravaSettings: false
      });
    case GOT_STRAVA_SETTINGS:
      return Object.assign({}, state, {
        stravaSettings: action.settings
      });
    case RECEIVE_EVENTS:
      return Object.assign({}, state, {
        events: action.events
      });
    case SET_ZOOM_LEVEL:
      return Object.assign({}, state, {
        zoomLevel: action.level
      });
    case TOGGLE_INFOPANEL:
      return Object.assign({}, state, {
        showInfoPanel: !state.showInfoPanel
      });
    case TOGGLE_GHOSTS:
      return Object.assign({}, state, {
        showInfoPanel: false
      });
    case SET_EVENT_NAME:
      return Object.assign({}, state, {
        eventName: action.event
      });
    default:
      return state;
  }
}

function stravaEfforts(state = {}, action) {
  switch (action.type) {
    case RECEIVE_STRAVA_EFFORT:
      let effortState = {}
      effortState[action.data.id] = action.data.positions;

      return Object.assign({}, state, effortState);
    default:
      return state;
  }
}

const rootReducer = combineReducers({
  profile: createReducer(RECEIVE_PROFILE),
  mapSettings: createReducer(RECEIVE_MAPSETTINGS),
  riders: createReducer(RECEIVE_RIDERS, []),
  world,
  login,
  environment,
	ghosts,
  summary,
  stravaEfforts,
  host: createReducer(RECEIVE_HOST),
  routing: routerReducer
})

function createReducer(actionType, defaultState = {}) {
  return function reducer(state = defaultState, action) {
    switch (action.type) {
      case actionType:
        return action.data;
      default:
        return state;
    }
  }
}

export default rootReducer
