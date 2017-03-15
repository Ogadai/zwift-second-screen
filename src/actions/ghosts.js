import axios from 'axios';
import { push } from 'react-router-redux';

import { dispatchRequest } from './fetch'

export const TOGGLE_GHOSTS = "TOGGLE_GHOSTS";

export function toggleGhosts() {
  return {
    type: TOGGLE_GHOSTS
  };
}

export const TOGGLE_ADDGHOST = "TOGGLE_ADDGHOST";

export function toggleAddGhost() {
  return (dispatch, getState) => {
    const state = getState();
    if (!state.ghosts.riderId && state.riders && state.riders.length) {
      dispatch(selectRider(state.riders[0].id))
    }

    dispatch({
      type: TOGGLE_ADDGHOST
    });
  }
}

export const CHANGED_RIDER = "CHANGED_RIDER";

function changedRider(riderId) {
  return {
    type: CHANGED_RIDER,
    riderId
  }
}

export function selectRider(riderId) {
  return dispatch => {
    dispatch(changedRider(riderId));
    dispatch(fetchActivities(riderId));
  }
}

function fetchActivities(riderId) {
  return dispatchRequest(`/activities/${riderId}`, receiveActivities);
}

export const RECEIVE_ACTIVITIES = "RECEIVE_ACTIVITIES";

export function receiveActivities(data) {
  return {
    type: RECEIVE_ACTIVITIES,
    data
  };
}

export function fetchGhosts(riderId) {
  return dispatchRequest(`/ghosts`, receiveGhosts);
}

export const RECEIVE_GHOSTS = "RECEIVE_GHOSTS";

export function receiveGhosts(data) {
  const isArray = Array.isArray(data);
  return {
    type: RECEIVE_GHOSTS,
    data: isArray ? data : [],
    showButton: isArray
  };
}

export const CHANGED_ACTIVITY = "CHANGED_ACTIVITY";

export function changedActivity(activityId) {
  return {
    type: CHANGED_ACTIVITY,
    activityId
  }
}

export const ADDING_GHOST = "ADDING_GHOST";
export const ADDED_GHOST = "ADDED_GHOST";

export function addGhost(riderId, activityId) {
  return dispatch => {
    dispatch({
      type: ADDING_GHOST
    });

    axios.put('/ghosts', { riderId, activityId })
      .then(() => {
        dispatch({
          type: ADDED_GHOST
        });
        dispatch(fetchGhosts());
     })
      .catch(error => {
        dispatch({
          type: ADDED_GHOST
        });
        if (error.response) {
          const { status, statusMessage } = error.response;
          console.error(`Error adding ghost : ${status} - ${statusMessage}`);
        } else {
          console.error(error);
        }
      });
  }
}

export const CHANGED_GHOST = "CHANGED_GHOST";

export function changedGhost(ghostId) {
  return {
    type: CHANGED_GHOST,
    ghostId
  }
}

export function removeGhost(ghostId) {
  return dispatch => {
    axios.delete(`/ghosts/${ghostId}`)
      .then(() => {
        dispatch(fetchGhosts());
      })
      .catch(error => {
        if (error.response) {
          const { status, statusMessage } = error.response;
          console.error(`Error removing ghost : ${status} - ${statusMessage}`);
        } else {
          console.error(error);
        }
      })
  }
}

export const REQUESTING_REGROUP = "REQUESTING_REGROUP";
export const RECEIVE_REGROUP = "RECEIVE_REGROUP";

export function requestRegroup() {
  return dispatch => {
    dispatch({
      type: REQUESTING_REGROUP
    });

    axios.post(`/ghosts/regroup`)
      .then(() => {
        dispatch({
					type: RECEIVE_REGROUP
        });
      })
      .catch(error => {
        if (error.response) {
          const { status, statusMessage } = error.response;
          console.error(`Error removing ghost : ${status} - ${statusMessage}`);
        } else {
          console.error(error);
        }

        dispatch({
          type: RECEIVE_REGROUP
        });
      })
  }
}

export function fetchActivity(riderId, activityId) {
  return dispatchRequest(`/rider/${riderId}/activity/${activityId}`, receiveActivity);
}

export const RECEIVE_ACTIVITY = "RECEIVE_ACTIVITY";

function receiveActivity(data) {
  return {
    type: RECEIVE_ACTIVITY,
    data
  };
}

export const RESET_GHOSTS = "RESET_GHOSTS";

export function resetGhosts() {
  return dispatch => {
     dispatch({
      type: RESET_GHOSTS
    });

    axios.delete(`/ghosts`)
      .then(() => {
        dispatch({ type: RESET_GHOSTS });
      })
      .catch(error => {
        if (error.response) {
          const { status, statusMessage } = error.response;
          console.error(`Error removing ghosts : ${status} - ${statusMessage}`);
        } else {
          console.error(error);
        }
      })
  }
}