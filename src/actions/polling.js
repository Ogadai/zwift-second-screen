﻿import axios from 'axios';
import { push } from 'react-router-redux';

import { fetchWorld, receivePositions, receiveWorld, receiveStrava } from './fetch';

const POLLING_INTERVAL = 2500;

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
    this.timeout = null;
  }

  init() {
    this.startInterval();
  }

  close() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
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

    this.dispatch(this.fetchWorldAndPoll());
  }

  onMessage(message) {
    switch (message.name.toLowerCase()) {
      case 'world':
        this.dispatch(receiveWorld(message.data));
        break;
      case 'positions':
        this.dispatch(receivePositions(message.data));
        break;
      case 'strava':
        this.dispatch(receiveStrava(message.data));
        break;
    }
  }

  fetchWorldAndPoll() {
    return (dispatch, getState) => {
      const state = getState();
      const interval = Math.max(state.world.interval, POLLING_INTERVAL);

      dispatch(fetchWorld());
      this.timeout = setTimeout(() => {
        dispatch(this.fetchWorldAndPoll());
      }, interval);
    }
  }
}
