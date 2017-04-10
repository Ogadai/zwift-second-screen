import axios from 'axios';
export const SET_MENU_STATE = "SET_MENU_STATE";

export function setMenuState(showMenu) {
  return {
    type: SET_MENU_STATE,
    visible: showMenu
  };
}

export const SHOW_WORLD_SELECTOR = "SHOW_WORLD_SELECTOR";

export function showWorldSelector(showSelector) {
  return {
    type: SHOW_WORLD_SELECTOR,
    visible: showSelector
  };
}

export function setWorld(worldId) {
  return dispatch => {
    axios.post(`/world`, { world: worldId })
      .then(() => {
        dispatch(showWorldSelector(false));
      })
      .catch(error => {
        if (error.response) {
          const { status, statusMessage } = error.response;
          console.error(`Error setting world : ${status} - ${statusMessage}`);
        } else {
          console.error(error);
        }
      })
  }
}
