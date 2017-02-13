import axios from 'axios';
import { push } from 'react-router-redux';

import { fetchWorld, fetchPositions, receivePositions, receiveWorld } from './fetch';

let pollingClient = null;

export function startPolling() {
  return dispatch => {
    if (pollingClient) {
      pollingClient.close();
    }
    pollingClient = new PollingClient(dispatch);
    pollingClient.init();
  }
}

export function stopPolling() {
  return dispatch => {
    pollingClient.close();
    pollingClient = null;
  }
}

class PollingClient {
  constructor(dispatch) {
    this.dispatch = dispatch;

    this.ws = null;
    this.interval = null;
  }

  init() {
    this.tryStartWebSocket();
  }

  close() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  tryStartWebSocket() {
    const { protocol, host } = window.location;
    const root = axios.defaults.baseURL ? axios.defaults.baseURL : `${protocol}//${host}`;
    const wsRoot = root.replace('http', 'ws');

    try {
      this.ws = new WebSocket(`${wsRoot}/listen`);

      this.ws.onmessage = event => {
        this.onMessage(JSON.parse(event.data));
      }
      this.ws.onerror = event => {
        console.error(event);
        this.startInterval();
      }
    } catch (ex) {
      console.error(ex);
      this.startInterval();
    }
  }

  startInterval() {
    if (this.ws) this.ws.close();
    this.ws = null;

    this.interval = setInterval(() => this.onInterval(), 3000);
  }

  onMessage(socketMessage) {
    switch (message.name.toLowerCase()) {
      case 'world':
        this.dispatch(receiveWorld(message.data));
        break;
      case 'positions':
        this.dispatch(receivePositions(message.data));
        break;
    }
  }

  onInterval() {
    this.dispatch(fetchWorld());
    this.dispatch(fetchPositions());
  }
}
