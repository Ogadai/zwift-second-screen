import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';

import { postLogin } from '../actions/login';
import { fetchHost, runHost, closeApp } from '../actions/host';

import s from './login.css';

class Login extends Component {
  static get propTypes() {
    return {
      overlay: PropTypes.bool,
			user: PropTypes.object,
      error: PropTypes.object,
      host: PropTypes.object,
      onSubmit: PropTypes.func.isRequired,
      onFetchHost: PropTypes.func,
      onRunHost: PropTypes.func,
      onCloseApp: PropTypes.func
    }
  }

  constructor(props) {
    super(props);

    this.state = {
      username: props.user ? props.user.username : '',
			password: ''
    };
  }

  componentDidMount() {
    const { onFetchHost } = this.props;

    if (onFetchHost) setTimeout(onFetchHost, 500);
  }

  render() {
    const { overlay, host, error, onRunHost, onCloseApp } = this.props;
    const { username, password } = this.state;

    return (
      <div className="login">
        {overlay
          ? <a className="close-button" href="#" onClick={onCloseApp}>X</a>
          : undefined}
				<div className="logo" />
        <form onSubmit={evt => this.onSubmitForm(evt)}>
          <h1>Log In</h1>
          {error ?
            <div className="error">
              {error.status}: {error.statusText}
            </div>
            : undefined}

					<fieldset>
            <input type="text" name="username" id="username" placeholder="Username" value={username} onChange={evt => this.setState({ username: evt.target.value })} />
            <input type="password" name="password" id="password" placeholder="Password" value={password} onChange={evt => this.setState({ password: evt.target.value })} />

						<input type="submit" value="Log in" />
          </fieldset>
        </form>

        {(onRunHost && overlay)
          ? <div className={classnames('host', { show: host && host.hosts && host.hosts.length })}>
	            <h1>Host</h1>
              <div className="host-info">
								<p>
									Run a host on your local network to view the map on a tablet or phone
								</p>
								<input type="button" value="Run Host" onClick={onRunHost} />
              </div>
						</div>
          : undefined}
        
      </div>
    )
  }

  onSubmitForm(evt) {
    evt.preventDefault();

    const { onSubmit } = this.props;
    const { username, password } = this.state;

    onSubmit(username, password);
  }
}

const mapStateToProps = (state) => {
  return {
    overlay: state.environment.electron,
		user: state.login.user,
    error: state.login.error,
		host: state.host
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    onSubmit: (username, password) => dispatch(postLogin(username, password)),
    onFetchHost: () => dispatch(fetchHost()),
    onRunHost: () => dispatch(runHost()),
    onCloseApp: closeApp
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Login);
