import React, { Component} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classnames from 'classnames';

import InfoDetail from './infoPanel/infoDetail';
import InfoWayPoints from './infoPanel/infoWaypoints';
import InfoScores from './infoPanel/infoScores';
import { toggleInfoPanel } from '../actions/summary';

import s from './infoPanel.css';

class InfoPanel extends Component {
  static get propTypes() {
    return {
      infoPanel: PropTypes.object,
      showPanel: PropTypes.bool,
      onTogglePanel: PropTypes.func.isRequired
    }
  }

  render() {
    const { infoPanel, showPanel, onTogglePanel } = this.props;

    return <div className={classnames("info-panel", { expanded: showPanel })}>
      <div className="display-area">
        <button className="minimize-button" onClick={onTogglePanel}>
          <span className="zwiftgps-icon icon-minimize">&nbsp;</span>
        </button>
        <div className="display-content">
          { infoPanel.details && <InfoDetail details={infoPanel.details} />}
          { infoPanel.scores && <InfoScores scores={infoPanel.scores} />}
          { infoPanel.showWaypoints && <InfoWayPoints /> }
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
    infoPanel: state.world.infoPanel,
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
