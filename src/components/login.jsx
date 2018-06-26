import React, { Component} from 'react';
import PropTypes from 'prop-types';
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
      match: PropTypes.shape({
        params: PropTypes.shape({
          type: PropTypes.string,
          id: PropTypes.string
        }).isRequired
      }).isRequired,
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
          {document.title}
          { overlay ? <a className="close-button" href="#" onClick={onCloseApp}>X</a> : undefined }
				</h1>

        <form onSubmit={evt => this.onSubmitForm(evt)}>
          <h2>Log In</h2>
          {error ?
            <div className="error">
              {!error.alt ? `${error.status}: ` : undefined}{error.statusText}

              {error.alt ?
                <div className="error-alt">
                  {error.alt.message}&nbsp;

                  {error.alt.link ?
                    <a href={error.alt.link.addr} target="_blank">{error.alt.link.caption}</a>
                    : undefined}
                </div>
                : undefined}
            </div>
            : undefined}

          {!error ?
            <div class="how-to">
              <h3>Step 1</h3>
              <div>Opt-In to sharing your Zwift activities with Zwift GPS</div>
              <a href="https://my.zwift.com/profile/connections" target="_blank">OPT-IN: Zwift Connections</a>
              <h3>Step 2</h3>
              <div>Enter your Zwift ID and Log In</div>
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
              <a href="http://zwiftblog.com/find-zwift-id/" target="_blank">How to find your Zwift ID</a>
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

        {!overlay
          ? <div className={classnames('download', { show: host && host.os === 'Windows' })}>
              <h2>Desktop Overlay</h2>
              <p>Install the desktop application to show a transparent overlay on top of Zwift on your Windows PC</p>
              <p><a href="https://install.openfin.co/download/?config=http%3A%2F%2Fwww.zwiftgps.com%2Fapp.json&fileName=zwiftgps-installer&unzipped=true">Download Installer</a></p>
            </div>
          : undefined}

        <div className="feedback">
          <a href="http://zwiftblog.com/zwiftgps/" target="_blank">Feedback</a>
        </div>
      </div>
    )
  }

  onSubmitForm(evt) {
    evt.preventDefault();

    const { user, match, onSubmit, onSubmitId } = this.props;
    const { username, password, id } = this.state;

    const loginType = user ? user.type : '';

    const event = match && match.params &&  match.params.event;

    if (loginType === 'user') {
      onSubmit(username, password, event);
    } else {
      onSubmitId(id, event);
    }
  }
}

const mapStateToProps = (state) => {
  return {
    overlay: state.environment.electron || state.environment.openfin,
		user: state.login.user,
    error: state.login.error,
    host: state.host
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    onRequestLoginType: () => dispatch(requestLoginType()),
    onSubmit: (username, password, event) => dispatch(postLogin(username, password, event)),
    onSubmitId: (id, event) => dispatch(postLoginById(id, event)),
    onFetchHost: () => dispatch(fetchHost()),
    onRunHost: () => dispatch(runHost()),
    onCloseApp: closeApp
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Login);
