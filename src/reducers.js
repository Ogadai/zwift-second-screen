import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'

import { RECEIVE_PROFILE, RECEIVE_POSITIONS, RECEIVE_WORLD, RECEIVE_MAPSETTINGS, RECEIVE_RIDERS } from './actions/fetch';
import { RECEIVE_LOGINTYPE, RECEIVE_LOGINFAILURE } from './actions/login';
import { RECEIVE_HOST } from './actions/host';
import {
  TOGGLE_GHOSTS, TOGGLE_ADDGHOST, CHANGED_RIDER, RECEIVE_ACTIVITIES, CHANGED_ACTIVITY,
  RECEIVE_GHOSTS, ADDING_GHOST, ADDED_GHOST, CHANGED_GHOST,
  REQUESTING_REGROUP, RECEIVE_REGROUP
} from './actions/ghosts';

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

function environment(state, action) {
  switch (action.type) {
    default:
      return {
        electron: navigator.userAgent.toLowerCase().indexOf('electron') !== -1
      };
  }
}

const defaultGhosts = {
	ghosts: [],
  show: false,
  addingGhost: false,
  riderId: null,
	loadingActivities: false,
  activities: [],
  activityId: null,
  waitingAddGhost: false,
  ghostId: null,
	requestingRegroup: false
}

function ghosts(state = defaultGhosts, action) {
  switch (action.type) {
    case RECEIVE_GHOSTS:
      return Object.assign({}, state, {
        ghosts: action.data
      });
    case TOGGLE_GHOSTS:
      return Object.assign({}, state, {
				show: !state.show
      });
    case TOGGLE_ADDGHOST:
      return Object.assign({}, state, {
        addingGhost: !state.addingGhost
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
				activityId: action.activityId
      });
    case ADDING_GHOST:
      return Object.assign({}, state, {
        waitingAddGhost: true
      });
    case ADDED_GHOST:
      return Object.assign({}, state, {
        waitingAddGhost: false,
        addingGhost: false
      });
    case CHANGED_GHOST:
      return Object.assign({}, state, {
        ghostId: action.ghostId
      });
    case REQUESTING_REGROUP:
      return Object.assign({}, state, {
        requestingRegroup: true
      });
		case RECEIVE_REGROUP:
      return Object.assign({}, state, {
        requestingRegroup: false
      });
    default:
      return state;
  }
}

const rootReducer = combineReducers({
  profile: createReducer(RECEIVE_PROFILE),
  positions: createReducer(RECEIVE_POSITIONS, []),
  world: createReducer(RECEIVE_WORLD),
  mapSettings: createReducer(RECEIVE_MAPSETTINGS),
  riders: createReducer(RECEIVE_RIDERS, []),
  login,
  environment,
	ghosts,
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
