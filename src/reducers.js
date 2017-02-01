import { combineReducers } from 'redux'

import { RECEIVE_PROFILE, RECEIVE_STATUS } from './actions';

function profile(state = {}, action) {
  switch (action.type) {
    case RECEIVE_PROFILE:
      return Object.assign({}, state, action.data);
    default:
      return state;
  }
}

function status(state = {}, action) {
  switch (action.type) {
    case RECEIVE_STATUS:
      return Object.assign({}, state, action.data);
    default:
      return state;
  }
}

const rootReducer = combineReducers({
  profile,
	status
})

export default rootReducer
