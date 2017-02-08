import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { fetchHost, closeApp } from '../actions';

import s from './host.css';

class Host extends Component {
  static get propTypes() {
    return {
      host: PropTypes.object,
      onFetchHost: PropTypes.func,
			onCloseApp: PropTypes.func
    }
  }

  componentDidMount() {
    const { onFetchHost, host } = this.props;

    if (onFetchHost && !host.hosts) onFetchHost();
  }

  render() {
    const { host, onCloseApp } = this.props;
    const hosts = host.hosts;

    return <div className="hosting">
      <h1 className="title-bar">
				Hosting Zwift GPS
				<a className="close-button" href="#" onClick={onCloseApp}>X</a>
      </h1>
      <div className="content">
				<p>On your tablet or phone, open a browser and go to one of these addresses:</p>
        <ul>
          {hosts ? hosts.map((h, i) =>
            <li className="host-address" key={`host-${i}`}>
              <a href={h} target="_blank">{h}</a>
            </li>
          ) : undefined}
        </ul>
      </div>
    </div>

  }
}

const mapStateToProps = (state) => {
  return {
		host: state.host
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    onFetchHost: () => dispatch(fetchHost()),
    onCloseApp: closeApp
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Host);

