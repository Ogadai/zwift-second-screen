import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';

import { checkCookieWarning, dismissCookieWarning } from '../actions/cookie-warning';

import s from './cookie-warning.css';

class CookieWarning extends Component {
  static get propTypes() {
    return {
        cookieWarning: PropTypes.bool,
        checkCookieWarning: PropTypes.func.isRequired,
        dismissCookieWarning: PropTypes.func.isRequired
    }
  }

  componentDidMount() {
      const { checkCookieWarning } = this.props;
      setTimeout(checkCookieWarning, 1000);
  }

  render() {
    const { cookieWarning, dismissCookieWarning } = this.props;
    return <div className={classnames("cookie-warning", { show: cookieWarning })}>
      <div className="content">
        This site uses cookies to improve your experience.
        <button onClick={dismissCookieWarning}>Got It</button>
      </div>
    </div>
  }
}

const mapStateToProps = (state) => {
  return {
      cookieWarning: state.environment.cookieWarning
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
      checkCookieWarning: () => dispatch(checkCookieWarning()),
      dismissCookieWarning: () => dispatch(dismissCookieWarning())
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CookieWarning);
