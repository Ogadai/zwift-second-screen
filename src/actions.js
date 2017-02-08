import axios from 'axios';
import { push } from 'react-router-redux';

export const RECEIVE_PROFILE = "RECEIVE_PROFILE";

function receiveProfile(data) {
  return {
    type: RECEIVE_PROFILE,
		data
  };
}

export function fetchProfile() {
  return dispatchRequest('/profile/', receiveProfile);
}

export const RECEIVE_POSITIONS = "RECEIVE_POSITIONS";

function receivePositions(data) {
  return {
    type: RECEIVE_POSITIONS,
    data
  };
}

export function fetchPositions() {
  return dispatchRequest('/positions/', receivePositions);
}

export const RECEIVE_MAPSETTINGS = "RECEIVE_MAPSETTINGS";

function receiveMapSettings(data) {
  return {
    type: RECEIVE_MAPSETTINGS,
    data
  };
}

export function fetchMapSettings() {
  return dispatchRequest('/mapSettings/', receiveMapSettings);
}


export const INITIALISE_LOGIN = "INITIALISE_LOGIN";
export function initialiseLogin(data) {
  return {
    type: INITIALISE_LOGIN,
    data
  };
}

export function redirectToLogin() {
  return dispatch => {
    const loginDetails = localStorage.getItem('login-details');
    if (loginDetails) {
      dispatch(initialiseLogin(JSON.parse(loginDetails)));
    }

    dispatch(push('/login'));
  }
}

export const RECEIVE_LOGINFAILURE = "RECEIVE_LOGINFAILURE";

function receiveLoginFailure(data) {
  return {
    type: RECEIVE_LOGINFAILURE,
    data
  };
}

export function postLogin(username, password) {
  return dispatch => {
    axios.post('/login', { username, password })
      .then(response => {
        localStorage.setItem('login-details', JSON.stringify({ username }));
				// Successful login
        dispatch(push('/'));
      })
      .catch(error => {
				// Failed to login
        dispatch(receiveLoginFailure(error.response));
      });
  }
}



function dispatchRequest(path, dispatchFn) {
  return dispatch => {
    axios.get(path)
      .then(response => dispatch(dispatchFn(response.data)))
      .catch(error => {
        const { status, statusMessage, message } = error.response || error;
        if (status === 401) {
					// Redirect to login
          dispatch(redirectToLogin());
        } else {
          const text = status > `${status} - ${statusMessage}` || message;
          console.error(`Error calling '${path}': ${text}`);
        }
      });
  }
}