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

export const RECEIVE_POSITIONS = "RECEIVE_POSITIONS";

function receivePositions(data) {
  return {
    type: RECEIVE_POSITIONS,
    data
  };
}

export function fetchPositions() {
  return dispatch => {
    axios.get('/positions/').then(response => dispatch(receivePositions(response.data)));
  }
}

export const RECEIVE_MAPSETTINGS = "RECEIVE_MAPSETTINGS";

function receiveMapSettings(data) {
  return {
    type: RECEIVE_MAPSETTINGS,
    data
  };
}

export function fetchMapSettings() {
  return dispatch => {
    axios.get('/mapSettings/').then(response => dispatch(receiveMapSettings(response.data)));
  }
}
