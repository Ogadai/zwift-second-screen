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

export const RECEIVE_WORLD = "RECEIVE_WORLD";

export function receiveWorld(data) {
  return {
    type: RECEIVE_WORLD,
    data
  };
}

export const RECEIVE_STRAVA = "RECEIVE_STRAVA";

export function receiveStrava(data) {
  return {
    type: RECEIVE_STRAVA,
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

export function fetchMapSettings(worldId, overlay) {
  const params = [];
  if (worldId) params.push(`world=${worldId}`);
  if (overlay) params.push('overlay=true');

  const queryParams = params.length ? `?${params.join('&')}` : '';
  return dispatchRequest(`/mapSettings/${queryParams}`, receiveMapSettings);
}

export function fetchRiders() {
  return dispatchRequestIfNeeded('/riders/', state => !state.riders || state.riders.length === 0, receiveRiders);
}

export const RECEIVE_RIDERS = "RECEIVE_RIDERS";

export function receiveRiders(data) {
  return {
    type: RECEIVE_RIDERS,
    data
  };
}

export function fetchStravaEffort(segmentId) {
  return dispatchRequestIfNeeded(`/strava-effort/${segmentId}`,
      (state, dispatch) => {
        const isMissing = !state.stravaEfforts || !state.stravaEfforts[segmentId];
        if (isMissing) {
          dispatch(receiveStravaEffort({ id: segmentId, positions: [] }));
        }
        return isMissing;
      }, receiveStravaEffort);
}

export const RECEIVE_STRAVA_EFFORT = "RECEIVE_STRAVA_EFFORT";

function receiveStravaEffort(data) {
  return {
    type: RECEIVE_STRAVA_EFFORT,
    data
  };
}

export function dispatchRequestIfNeeded(path, shouldGetFn, dispatchFn) {
  return (dispatch, getState) => {
    if (shouldGetFn(getState(), dispatch)) {
      return dispatch(dispatchRequest(path, dispatchFn));
    } else {
      return Promise.resolve();
    }
  }
}

export function dispatchRequest(path, dispatchFn) {
  return dispatch => {
    axios.get(path)
      .then(response => dispatch(dispatchFn(response.data)))
      .catch(error => {
        const { status, statusMessage } = error.response || error;
        if (status === 401) {
					// Redirect to login
          dispatch(redirectToLogin());
        } else {
          if (!status)
            console.error(`Error calling '${path}': ${error.message}`);
          else
            console.error(`Error calling '${path}': ${status} - ${statusMessage}`);
        }
      });
  }
}
