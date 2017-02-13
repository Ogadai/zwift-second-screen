import axios from 'axios';
import { push } from 'react-router-redux';

import { redirectToLogin } from './login';

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

export function receivePositions(data) {
  return {
    type: RECEIVE_POSITIONS,
    data
  };
}

export function fetchPositions() {
  return dispatchRequest('/positions/', receivePositions);
}

export const RECEIVE_WORLD = "RECEIVE_WORLD";

function receiveWorld(data) {
  return {
    type: RECEIVE_WORLD,
    data
  };
}

export function fetchWorld() {
  return dispatchRequest('/world/', receiveWorld);
}

export const RECEIVE_MAPSETTINGS = "RECEIVE_MAPSETTINGS";

function receiveMapSettings(data) {
  return {
    type: RECEIVE_MAPSETTINGS,
    data
  };
}

export function fetchMapSettings(worldId) {
  const worldParam = worldId ? `?world=${worldId}` : '';
  return dispatchRequest(`/mapSettings/${worldParam}`, receiveMapSettings);
}

export function dispatchRequest(path, dispatchFn) {
  return dispatch => {
    axios.get(path)
      .then(response => dispatch(dispatchFn(response.data)))
      .catch(error => {
        const { status, statusMessage } = error.response;
        if (status === 401) {
					// Redirect to login
          dispatch(redirectToLogin());
        } else {
          console.error(`Error calling '${path}': ${status} - ${statusMessage}`);
        }
      });
  }
}
