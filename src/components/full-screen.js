import NoSleep from 'nosleep.js/dist/NoSleep.js';

const noSleep = new NoSleep();

export function toggleFullScreen() {
  const doc = window.document;

  try {
    if (!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
      activateFullScreen();
    }
    else {
      deactivateFullScreen();
    }
  } catch (ex) {
    console.log(`error trying to toggle full screen - ${ex.message}`);
  }
}

function activateFullScreen() {
  const docEl = window.document.documentElement;
  const requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;

  requestFullScreen.call(docEl);
  noSleep.enable();

  window.addEventListener('blur', deactivateFullScreen);
}

function deactivateFullScreen() {
  window.removeEventListener('blur', deactivateFullScreen);
  const doc = window.document;
  const cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

  cancelFullScreen.call(doc);
  noSleep.disable();
}
