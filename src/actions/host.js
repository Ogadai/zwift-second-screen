import { push } from 'react-router-redux';
import { dispatchRequest } from './fetch';

export const RECEIVE_HOST = "RECEIVE_HOST";

function receiveHost(data) {
  return {
    type: RECEIVE_HOST,
    data
  };
}

export function fetchHost() {
  return dispatchRequest('/host/', receiveHost);
}

export function runHost() {
  return dispatch => {
    if (window["require"]) {
      const electron = window["require"]('electron');
      const browserWindow = electron.remote.BrowserWindow;
      const win = browserWindow.getFocusedWindow();

      win.setBounds({ x: 50, y: 50, width: 400, height: 250 });
      win.setAlwaysOnTop(false);
    }

    dispatch(push('/host'));
  }
}

export function closeApp() {
  window.close();
}
