import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';

import { fetchProfile } from '../actions/fetch';

import s from './summary.css';

class Summary extends Component {
  static get propTypes() {
    return {
      profile: PropTypes.object.isRequired,
      mapSettings: PropTypes.object,
      onFetch: PropTypes.func.isRequired
    };
  }

  componentDidMount() {
    const { onFetch } = this.props;
    onFetch();
    this.fetchInterval = setInterval(onFetch, 10000);
  }

  componentWillUnmount() {
    clearInterval(this.fetchInterval);
  }

  render() {
    const { profile, mapSettings } = this.props;
    const disabled = !profile.riding;
    return (
      <div className={classnames("summary", { "custom-map": mapSettings && mapSettings.map })}>
        <div className={classnames("logo", { disabled })}></div>
        <div className="player-name">
          <span className={classnames("name", { disabled })}>
            {profile.firstName} {profile.lastName}
          </span>
          <a className="logout" href="/login"><img src="/img/logout.png"/></a>
				</div>
      </div>
    )
  }
	
}

const mapStateToProps = (state) => {
  return {
    profile: state.profile,
    mapSettings: state.mapSettings
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    onFetch: () => dispatch(fetchProfile())
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Summary);
