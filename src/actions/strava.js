import axios from 'axios';

export function connectStrava() {
  return stravaRequest('/strava/connect', (dispatch, response) => {
    const { url } = response.data;
    if (url) {
        window.location = url;
    }
  });
}

export function disconnectStrava() {
  return stravaRequest('/strava/disconnect', (dispatch, response) => {
    dispatch(disconnectedStrava());
  });
}

export const DISCONNECTED_STRAVA = "DISCONNECTED_STRAVA";
function disconnectedStrava() {
  return {
    type: DISCONNECTED_STRAVA
  };
}

export function getStravaSettings() {
  return stravaRequest('/strava/settings', (dispatch, response) => {
    dispatch(getStravaSettingsResponse(response));
  });
}

export const GOT_STRAVA_SETTINGS = "GOT_STRAVA_SETTINGS";
function getStravaSettingsResponse(response) {
  return {
    type: GOT_STRAVA_SETTINGS,
    settings: response.data
  };
}

export function saveStravaSettings(settings) {
  return dispatch => {
    axios.post('/strava/settings', settings)
    .then(response => {
      dispatch({
        type: GOT_STRAVA_SETTINGS,
        settings: settings
      });
    })
    .catch(errorFn);
  }
}

function stravaRequest(path, responseFn) {
  return dispatch => {
    axios.get(path)
      .then(response => responseFn(dispatch, response))
      .catch(errorFn);
  }
}

function errorFn(error) {
  const { status, statusMessage } = error.response || error;
  if (!status)
      console.error(`Error calling '${path}': ${error.message}`);
  else
      console.error(`Error calling '${path}': ${status} - ${statusMessage}`);
}