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
    dispatch(disconnectedStrava())
  });
}


export const DISCONNECTED_STRAVA = "DISCONNECTED_STRAVA";
function disconnectedStrava() {
  return {
    type: DISCONNECTED_STRAVA
  };
}

function stravaRequest(path, responseFn) {
  return dispatch => {
    axios.get(path)
      .then(response => responseFn(dispatch, response))
      .catch(error => {
        const { status, statusMessage } = error.response || error;
        if (!status)
            console.error(`Error calling '${path}': ${error.message}`);
        else
            console.error(`Error calling '${path}': ${status} - ${statusMessage}`);
      });
  }
}
