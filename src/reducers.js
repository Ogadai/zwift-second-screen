import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'

import { RECEIVE_PROFILE, RECEIVE_POSITIONS, RECEIVE_WORLD, RECEIVE_MAPSETTINGS } from './actions/fetch';
import { RECEIVE_LOGINTYPE, RECEIVE_LOGINFAILURE } from './actions/login';
import { RECEIVE_HOST } from './actions/host';

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

const rootReducer = combineReducers({
  profile: createReducer(RECEIVE_PROFILE),
  positions: createReducer(RECEIVE_POSITIONS, []),
  world: createReducer(RECEIVE_WORLD),
  mapSettings: createReducer(RECEIVE_MAPSETTINGS),
  login,
  environment,
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
