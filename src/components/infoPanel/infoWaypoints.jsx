import React, { Component} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classnames from 'classnames';
import images from '../../images/images';

import s from './infoWaypoints.css';

class InfoWayPoints extends Component {
  static get propTypes() {
    return {
      waypoints: PropTypes.array
    }
  }

  render() {
    const { waypoints } = this.props;

    return <ul className="info-waypoints">
      {waypoints && waypoints.map((point, index) => this.renderWaypoint(point, index))}
    </ul>
  }

  renderWaypoint(point, index) {
    const { name, image, visited } = point;
    const imageSrc = image && images[image] ? images[image] : images.standard;

    return <li key={`waypoint-${index}`}>
      <img className={classnames('waypoint-image', { visited })} alt={point.name} src={imageSrc} />
      {point.name}
    </li>;
  }
}

const mapStateToProps = (state) => {
  return {
    waypoints: state.world.points
  }
}

const mapDispatchToProps = (dispatch) => {
  return {

  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(InfoWayPoints);
