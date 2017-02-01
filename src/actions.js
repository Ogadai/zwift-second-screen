import axios from 'axios';

export const RECEIVE_PROFILE = "RECEIVE_PROFILE";

function receiveProfile(data) {
  return {
    type: RECEIVE_PROFILE,
		data
  };
}

export function fetchProfile() {
  return dispatch => {
    axios.get('/profile/').then(response => dispatch(receiveProfile(response.data)));
  }
}

export const RECEIVE_STATUS = "RECEIVE_STATUS";

function receiveStatus(data) {
  return {
    type: RECEIVE_STATUS,
    data
  };
}

export function fetchStatus() {
  return dispatch => {
    axios.get('/status/').then(response => dispatch(receiveStatus(response.data)));
  }
}
