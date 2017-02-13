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
  
  constructor(props) {
    super(props);
    this.state = {
      error: null
    }
  }

  componentDidMount() {
    const { protocol, host } = window.location;
    const root = axios.defaults.baseURL ? axios.defaults.baseURL : `${protocol}//${host}`;
    const wsRoot = root.replace('http', 'ws');

    this.ws = new WebSocket(`${wsRoot}/listen`);
    
    this.ws.onmessage = event => {
      this.onMessage(JSON.parse(event.data));
    }
    this.ws.onerror = event => {
      this.setState({ error: JSON.stringify(event) });
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
    const { error } = this.state;
		return <span className={ error ? 'socket-error' : 'socket-client' }>
		  {error}
		</span>
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
