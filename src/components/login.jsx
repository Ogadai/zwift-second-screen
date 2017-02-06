import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

class Login extends Component {
  static get propTypes() {
    return {
    }
  }

  render() {
    return (
      <div className="zwift-app">
        Login placeholder
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Login);
