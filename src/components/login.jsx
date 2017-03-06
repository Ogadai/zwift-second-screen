import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';

import { requestLoginType, postLogin, postLoginById } from '../actions/login';
import { fetchHost, runHost, closeApp } from '../actions/host';

import CookieWarning from './cookie-warning';

import s2 from './app.css';
import s from './login.css';

class Login extends Component {
  static get propTypes() {
    return {
      overlay: PropTypes.bool,
			user: PropTypes.object,
      error: PropTypes.object,
      host: PropTypes.object,
      onSubmit: PropTypes.func.isRequired,
      onSubmitId: PropTypes.func.isRequired,
      onRequestLoginType: PropTypes.func.isRequired,
      onFetchHost: PropTypes.func,
      onRunHost: PropTypes.func,
      onCloseApp: PropTypes.func
    }
  }

  constructor(props) {
    super(props);

    this.state = {
      username: props.user ? props.user.username : '',
      password: '',
      id: props.user ? props.user.id : ''
    };
  }

  componentDidMount() {
    const { onRequestLoginType, onFetchHost } = this.props;

    onRequestLoginType();
    if (onFetchHost) setTimeout(onFetchHost, 500);
  }

  componentWillReceiveProps(props) {
    this.setState({
      username: this.state.username || (props.user ? props.user.username : ''),
      id: this.state.id || (props.user ? props.user.id : '')
    });
  }

  render() {
    const { user, overlay, host, error, onRunHost, onCloseApp } = this.props;
    const { username, password, id } = this.state;
    const loginType = user ? user.type : '';

    return (
      <div className="login">
        <CookieWarning />
        <h1 className="title-bar">
          Zwift GPS
          { overlay ? <a className="close-button" href="#" onClick={onCloseApp}>X</a> : undefined }
				</h1>

        <form onSubmit={evt => this.onSubmitForm(evt)}>
          <h2>Log In</h2>
          {error ?
            <div className="error">
              {error.status}: {error.statusText}
            </div>
            : undefined}

          <fieldset>
            {loginType === 'user'
              ? [
                <input key="username" type="text" name="username" id="username" placeholder="Username" value={username} onChange={evt => this.setState({ username: evt.target.value })} />,
                <input key="password" type="password" name="password" id="password" placeholder="Password" value={password} onChange={evt => this.setState({ password: evt.target.value })} />
								] : undefined}

            {loginType === 'id'
              ? <input type="text" name="riderid" id="riderid" placeholder="Zwift ID" value={id} onChange={evt => this.setState({ id: evt.target.value })} />
							: undefined}

						<input type="submit" value="Log in" />

            {loginType === 'id'
            ? <span className="find-zwift-id">
              <a href="http://zwiftblog.com/zwift-id-ios/" target="_blank">How to find your Zwift ID</a>
              </span>
            : undefined }
          </fieldset>
        </form>

        {(onRunHost && overlay)
          ? <div className={classnames('host', { show: host && host.hosts && host.hosts.length })}>
	            <h2>Host</h2>
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

    const { user, onSubmit, onSubmitId } = this.props;
    const { username, password, id } = this.state;

    const loginType = user ? user.type : '';

    if (loginType === 'user') {
      onSubmit(username, password);
    } else {
      onSubmitId(id);
    }
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
    onRequestLoginType: () => dispatch(requestLoginType()),
    onSubmit: (username, password) => dispatch(postLogin(username, password)),
    onSubmitId: id => dispatch(postLoginById(id)),
    onFetchHost: () => dispatch(fetchHost()),
    onRunHost: () => dispatch(runHost()),
    onCloseApp: closeApp
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Login);
