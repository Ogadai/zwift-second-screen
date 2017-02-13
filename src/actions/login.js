import axios from 'axios';
import { push } from 'react-router-redux';

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
