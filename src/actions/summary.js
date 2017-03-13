export const SET_MENU_STATE = "SET_MENU_STATE";

export function setMenuState(showMenu) {
  return {
    type: SET_MENU_STATE,
    visible: showMenu
  };
}
