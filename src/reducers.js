import { combineReducers } from 'redux'

import { RECEIVE_PROFILE, RECEIVE_FANSPEED } from './actions';

function profile(state = {}, action) {
  switch (action.type) {
    case RECEIVE_PROFILE:
      return Object.assign({}, state, action.data);
    default:
      return state;
  }
}

const defaultFanSpeed = {
  speed: 0,
  fan: 0
};

function fanSpeed(state = defaultFanSpeed, action) {
  switch (action.type) {
    case RECEIVE_FANSPEED:
      return Object.assign({}, state, action.data);
    default:
      return state;
  }
}

const rootReducer = combineReducers({
  profile,
	fanSpeed
})

export default rootReducer
