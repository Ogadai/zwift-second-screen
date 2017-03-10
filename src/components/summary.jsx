import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';

import { fetchProfile } from '../actions/fetch';
import { requestLoginType } from '../actions/login';

import s from './summary.css';

class Summary extends Component {
  static get propTypes() {
    return {
      profile: PropTypes.object.isRequired,
      user: PropTypes.object,
      mapSettings: PropTypes.object,
      onRequestLoginType: PropTypes.func.isRequired,
      onFetch: PropTypes.func.isRequired
    };
  }

  componentDidMount() {
    const { onFetch, onRequestLoginType } = this.props;
    onFetch();
    onRequestLoginType();
    this.fetchInterval = setInterval(onFetch, 10000);
  }

  componentWillUnmount() {
    clearInterval(this.fetchInterval);
  }

  render() {
    const { profile, mapSettings, user } = this.props;
    const { credit } = mapSettings;
    const disabled = !profile.riding;
    return (
      <div className={classnames("summary", { "custom-map": mapSettings && mapSettings.map })}>
        <div className={classnames("logo", { disabled })}></div>
        <div className="player-name">
          <span className={classnames("name", { disabled })}>
            {profile.firstName} {profile.lastName}
          </span>
          { (user && user.canLogout)
          ? <a className="logout" href="/login"><img src="/img/logout.png"/></a>
          : undefined }
				</div>
        {credit ?
          <div className="map-attribute">
            {credit.prompt || 'Map by'} <a href={credit.href} target="_blank">{credit.name}</a>
          </div>
        : undefined }
      </div>
    )
  }
	
}

const mapStateToProps = (state) => {
  return {
    profile: state.profile,
		user: state.login.user,
    mapSettings: state.mapSettings
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    onRequestLoginType: () => dispatch(requestLoginType()),
    onFetch: () => dispatch(fetchProfile())
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Summary);
