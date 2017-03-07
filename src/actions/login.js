import axios from 'axios';
import { push } from 'react-router-redux';

export function requestLoginType(data) {
  return (dispatch, getState) => {
    const state = getState();
    if (!state.login || !state.login.user) {
      axios.get('/logintype').then(response => dispatch(receiveLoginType(response.data)))
    }
  }
}

export const RECEIVE_LOGINTYPE = "RECEIVE_LOGINTYPE";
function receiveLoginType(data) {
  const loginDetails = localStorage.getItem('login-details');
  let loginData = data;
  if (loginDetails) {
    loginData = Object.assign({}, data, JSON.parse(loginDetails));
  }
  return {
    type: RECEIVE_LOGINTYPE,
    data: loginData
  };
}

export function redirectToLogin() {
  return push('/login');
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
        setLoginDetails({ username });
        // Successful login
        dispatch(push('/'));
      })
      .catch(error => {
        // Failed to login
        dispatch(receiveLoginFailure(error.response));
      });
  }
}

export function postLoginById(id) {
  return dispatch => {
    axios.post('/login', { id })
      .then(response => {
        setLoginDetails({ id });
        // Successful login
        dispatch(push('/'));
      })
      .catch(error => {
        // Failed to login
        dispatch(receiveLoginFailure(error.response.data || error.response));
      });
  }
}

function setLoginDetails(settings) {
  const loginDetails = localStorage.getItem('login-details');
  const details = loginDetails ? JSON.parse(loginDetails) : {}
  localStorage.setItem('login-details', JSON.stringify(Object.assign(details, settings)));
}