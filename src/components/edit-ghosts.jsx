import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import Ghosts from './ghosts';

import s from './edit-ghosts.css';

class EditGhosts extends Component {
  static get propTypes() {
    return {
    }
  }

  render() {
    return <div className="edit-ghosts">
      <Ghosts />
    </div>
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
)(EditGhosts);
