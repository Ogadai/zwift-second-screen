import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';

import InfoZwiftQuest from './infoPanel/infoZwiftQuest';
import { toggleInfoPanel } from '../actions/summary';

import s from './infoPanel.css';

class InfoPanel extends Component {
  static get propTypes() {
    return {
      showPanel: PropTypes.bool,
      onTogglePanel: PropTypes.func.isRequired
    }
  }

  render() {
    const { showPanel, onTogglePanel } = this.props;

    const showInfo = window.location.href.indexOf('/zwiftquest') !== -1;

    return showInfo && <div className={classnames("info-panel", { expanded: showPanel })}>
      <div className="display-area">
        <button className="minimize-button" onClick={onTogglePanel}>
          <span className="zwiftgps-icon icon-minimize">&nbsp;</span>
        </button>
        <div className="display-content">
          <InfoZwiftQuest />
        </div>
      </div>

      <button className="app-button info-panel-button" onClick={onTogglePanel}>
        <span className="zwiftgps-icon icon-info-panel">&nbsp;</span>
      </button>
    </div>
  }
}

const mapStateToProps = (state) => {
  return {
    showPanel: state.summary.showInfoPanel
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    onTogglePanel: () => dispatch(toggleInfoPanel())
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(InfoPanel);
