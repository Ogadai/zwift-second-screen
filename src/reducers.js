import { combineReducers } from 'redux'

import { RECEIVE_PROFILE, RECEIVE_POSITIONS, RECEIVE_MAPSETTINGS } from './actions';

function profile(state = {}, action) {
  switch (action.type) {
    case RECEIVE_PROFILE:
      return action.data;
    default:
      return state;
  }
}

function positions(state = [], action) {
  switch (action.type) {
    case RECEIVE_POSITIONS:
      return action.data;
    default:
      return state;
  }
}

function mapSettings(state = {}, action) {
  switch (action.type) {
    case RECEIVE_MAPSETTINGS:
      return action.data;
    default:
      return state;
  }
}

const rootReducer = combineReducers({
  profile,
  positions,
  mapSettings
})

export default rootReducer
