import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { postLogin } from '../actions';

import s from './login.css';

class Login extends Component {
  static get propTypes() {
    return {
			user: PropTypes.object,
      error: PropTypes.object,
			onSubmit: PropTypes.func.isRequired
    }
  }

  constructor(props) {
    super(props);

    this.state = {
      username: props.user ? props.user.username : '',
			password: ''
    };
		console.log(this.state)
  }

  render() {
    const { error } = this.props;
    const { username, password } = this.state;

    return (
      <div className="login">
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
					</fieldset>

					<input type="submit" value="Log in" />
        </form>
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
		user: state.login.user,
    error: state.login.error
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    onSubmit: (username, password) => dispatch(postLogin(username, password))
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Login);
