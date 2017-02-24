import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';

import {
  toggleGhosts, toggleAddGhost, selectRider, changedActivity,
  fetchGhosts, addGhost, changedGhost, removeGhost,
  requestRegroup, fetchActivity
} from '../actions/ghosts';
import { fetchRiders } from '../actions/fetch';

import s from './ghosts.css';

class Ghosts extends Component {
  static get propTypes() {
    return {
      ghosts: PropTypes.array,
      showPanel: PropTypes.bool,
      addingGhost: PropTypes.bool,
      riders: PropTypes.array,
      riderId: PropTypes.number,
      loadingActivities: PropTypes.bool,
      activites: PropTypes.array,
      activityId: PropTypes.number,
      onToggleGhosts: PropTypes.func.isRequired,
      onToggleAddGhost: PropTypes.func.isRequired,
      onFetchRiders: PropTypes.func.isRequired,
      onFetchGhosts: PropTypes.func.isRequired,
      onSelectRider: PropTypes.func.isRequired,
      onChangeActivity: PropTypes.func.isRequired,
      onAddGhost: PropTypes.func.isRequired,
      waitingAddGhost: PropTypes.bool,
      ghostId: PropTypes.number,
      onRemoveGhost: PropTypes.func.isRequired,
      requestingRegroup: PropTypes.bool,
      onRequestRegroup: PropTypes.func.isRequired,
      onFetchActivity: PropTypes.func.isRequired,
    }
  }

  componentDidMount() {
    const { onFetchRiders, onFetchGhosts } = this.props;
    onFetchRiders();
    onFetchGhosts();
  }

  render() {
    const { showPanel, addingGhost, onToggleGhosts } = this.props;

    return <div className={classnames("ghosts", { expanded: showPanel })}>
      {addingGhost ? this.renderActivityList() : this.renderGhostList() }

      <button className="ghosts-button" onClick={onToggleGhosts}><span>&gt;</span></button>
    </div>
  }

	renderGhostList() {
    const { onToggleAddGhost, ghosts, requestingRegroup, onRequestRegroup } = this.props;
    const disabled = requestingRegroup || ghosts.length == 0
		return <div className="display-area">
			<h1>Ghosts</h1>
			<div className="list">
        <ul>{ghosts.map(g => this.renderGhost(g))}</ul>
			</div>
      <footer>
        <input className={classnames("regroup-button", { disabled })}
          disabled={disabled} type="button" value="Regroup" onClick={onRequestRegroup} />
				<input className="add-ghost-button" type="button" value="+" onClick={onToggleAddGhost} />
			</footer>
		</div>;
	}

  renderActivityList() {
    const { riders, riderId, loadingActivities, activities, activityId, onToggleAddGhost, onSelectRider, onAddGhost, waitingAddGhost } = this.props;
    const disabled = !activityId || waitingAddGhost
		return <div className="display-area adding">
      <header>
        <input className="back-button" type="button" value="<" onClick={onToggleAddGhost} />
        <select value={riderId || -1} onChange={event => onSelectRider(event.target.value)}>
          {riders.map(r => <option key={r.id} value={r.id}>{r.firstName} {r.lastName} Activities</option>)}
        </select>
      </header>
      <div className="list">
        {!activities.length
          ? <span className="message">{loadingActivities ? 'Loading...' : 'No activities'}</span>
          : <ul>{activities.map(a => this.renderActivity(a))}</ul>
        }
			</div>
			<footer>
        <input className={classnames("submit-add-ghost", { disabled })}
          disabled={disabled} type="button" value={waitingAddGhost ? 'Adding...' : 'Add Ghost'}
          onClick={() => onAddGhost(riderId, activityId)} />
			</footer>
		</div>;
	}

  renderActivity(activity) {
    const { riderId, activityId, onChangeActivity, onFetchActivity } = this.props;
    const { id, name, distanceInMeters, duration, totalElevation, avgWatts } = activity;

    return <li key={id}
				className={classnames("activity", { selected: activityId === id })}
				onClick={() => {
          onChangeActivity(id);
          onFetchActivity(riderId, id);
        }}
      >
      <h2 className="name">{name}</h2>
      <div className="details">
        <div className="detail-entry">
          <h3>Distance</h3>
          <span className="value">{Math.round(distanceInMeters / 100) / 10}km</span>
        </div>
        <div className="detail-entry">
          <h3>Time</h3>
          <span className="value">{duration} min</span>
        </div>
        <div className="detail-entry">
          <h3>Elevation</h3>
          <span className="value">{Math.round(totalElevation)}m</span>
        </div>
        <div className="detail-entry">
          <h3>Avg. watts</h3>
          <span className="value">{Math.round(avgWatts)}w</span>
        </div>
      </div>
    </li>
  }

  renderGhost(ghost) {
    const { ghostId, onChangedGhost, onRemoveGhost, onFetchActivity } = this.props;
    const { id, name } = ghost;

    return <li key={id}
				className={classnames({ selected: ghostId === id })}
				onClick={() => {
          onChangedGhost(id);
          onFetchActivity(0, id);
        }}
      >
      {name}

      {(ghostId === id)
        ? <input className="remove-button" type="button" value="X" onClick={() => onRemoveGhost(ghostId)} />
        : undefined}
    </li>
  }
}

const mapStateToProps = (state) => {
  return {
    ghosts: state.ghosts.ghosts,
    showPanel: state.ghosts.show,
    addingGhost: state.ghosts.addingGhost,
    riders: state.riders,
    riderId: state.ghosts.riderId,
    loadingActivities: state.ghosts.loadingActivities,
    activities: state.ghosts.activities,
    activityId: state.ghosts.activityId,
    waitingAddGhost: state.ghosts.waitingAddGhost,
    ghostId: state.ghosts.ghostId,
    requestingRegroup: state.ghosts.requestingRegroup
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    onToggleGhosts: () => dispatch(toggleGhosts()),
    onToggleAddGhost: () => dispatch(toggleAddGhost()),
    onFetchRiders: () => dispatch(fetchRiders()),
    onFetchGhosts: () => dispatch(fetchGhosts()),
    onSelectRider: (riderId) => dispatch(selectRider(parseInt(riderId))),
    onChangeActivity: (activityId) => dispatch(changedActivity(parseInt(activityId))),
    onAddGhost: (riderId, activityId) => dispatch(addGhost(riderId, activityId)),
    onChangedGhost: (ghostId) => dispatch(changedGhost(parseInt(ghostId))),
    onRemoveGhost: (ghostId) => dispatch(removeGhost(ghostId)),
    onRequestRegroup: () => dispatch(requestRegroup()),
    onFetchActivity: (riderId, activityId) => dispatch(fetchActivity(riderId, activityId))
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Ghosts);
