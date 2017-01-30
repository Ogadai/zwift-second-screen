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

export const RECEIVE_FANSPEED = "RECEIVE_FANSPEED";

function receiveFanSpeed(data) {
  return {
    type: RECEIVE_FANSPEED,
    data
  };
}

export function fetchFanSpeed() {
  return dispatch => {
    axios.get('/fan/').then(response => dispatch(receiveFanSpeed(response.data)));
  }
}

export function setFanSpeed(speed) {
  return dispatch => {
    axios.post('/fan/', { speed }).then(response => dispatch(receiveFanSpeed(response.data)));
  }
}
