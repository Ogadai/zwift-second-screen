import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Ghosts from './ghosts';

import s from './edit-ghosts.css';

class EditGhosts extends Component {
  static get propTypes() {
    return {
      riderId: PropTypes.number,
      activityId: PropTypes.number,
      ghostId: PropTypes.number
    }
  }

  constructor(props) {
    super(props);

    const electronRequire = window['require'];
    if (electronRequire) {
      this.ipcRenderer = electronRequire('electron').ipcRenderer
    }

    document.title = `${document.title} - ghosts`;
  }

  componentWillReceiveProps(props) {
    const { riderId, activityId, ghostId } = props
    if (this.ipcRenderer) {
      if (activityId !== this.props.activityId) {
        this.ipcRenderer.send('preview-activity', riderId, activityId);
      } else if (!activityId && ghostId !== this.props.ghostId) {
        this.ipcRenderer.send('preview-activity', 0, ghostId);
      }
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
    riderId: state.ghosts.riderId,
    activityId: state.ghosts.activityId,
    ghostId: state.ghosts.ghostId,
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
