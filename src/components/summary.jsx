import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';

import { fetchProfile } from '../actions';

class Summary extends Component {
  static get propTypes() {
    return {
      profile: PropTypes.object.isRequired,
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
    const { profile } = this.props;
    return (
      <div className={classnames("summary", { disabled: !profile.riding })}>
        <div className="logo"></div>
        <div className="player-name">
          {profile.firstName} {profile.lastName}
          {profile.riding ? " is riding" : " is not riding"}
				</div>
      </div>
    )
  }

  triggerFetch() {

  }
	
}

const mapStateToProps = (state) => {
  return {
    profile: state.profile
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
