import axios from 'axios';
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { receivePositions, receiveWorld } from '../actions';

import s from './socket-client.css';

class SocketClient extends Component {
  static get propTypes() {
    return {
      onReceivePositions: PropTypes.func.isRequired,
      onReceiveWorld: PropTypes.func.isRequired
    };
  }

  componentDidMount() {
    const root = axios.defaults.baseURL ? axios.defaults.baseURL.replace('http', 'ws') : `ws://${window.location.host}`;
    this.ws = new WebSocket(`${root}/listen`);
    this.ws.onmessage = event => {
      console.log(event);
      this.onMessage(JSON.parse(event.data));
    }
  }

  componentWillUnmount() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  onMessage(message) {
    const { onReceiveWorld, onReceivePositions } = this.props;

    switch (message.name.toLowerCase()) {
      case 'world':
        onReceiveWorld(message.data);
        break;
      case 'positions':
        onReceivePositions(message.data);
        break;
    }
  }

  render() {
		return <span className="socket-client"></span>
  }
}

const mapStateToProps = (state) => {
  return {
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    onReceivePositions: (data) => dispatch(receivePositions(data)),
    onReceiveWorld: (data) => dispatch(receiveWorld(data))
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SocketClient);
