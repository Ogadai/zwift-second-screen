import { push } from 'react-router-redux';
import { dispatchRequest } from './fetch';

export const RECEIVE_HOST = "RECEIVE_HOST";

function receiveHost(data) {
  return {
    type: RECEIVE_HOST,
    data: Object.assign({ os: getOS() }, data)
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

function getOS() {
  var userAgent = window.navigator.userAgent,
      platform = window.navigator.platform,
      macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'],
      windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'],
      iosPlatforms = ['iPhone', 'iPad', 'iPod'],
      os = null;

  if (macosPlatforms.indexOf(platform) !== -1) {
    os = 'Mac OS';
  } else if (iosPlatforms.indexOf(platform) !== -1) {
    os = 'iOS';
  } else if (windowsPlatforms.indexOf(platform) !== -1) {
    os = 'Windows';
  } else if (/Android/.test(userAgent)) {
    os = 'Android';
  } else if (!os && /Linux/.test(platform)) {
    os = 'Linux';
  }

  return os;
}
