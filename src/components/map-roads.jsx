import axios from 'axios';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classnames from 'classnames';

import { fetchStravaEffort } from '../actions/fetch';

import s from './map-roads.css';

export default class MapRoads extends Component {
  static get propTypes() {
    return {
      roads: PropTypes.array
    }
  }

  render() {
    const { roads } = this.props;

    return <g className="map-roads">
        { roads.filter(r => r.glow).map(r => this.renderRoute(r, 'route-glow'))}
        { roads.map(r => this.renderRoute(r, 'route-line'))}
    </g>
  }

  renderRoute(route, className) {
    const points = route.positions.map(p => `${p.x},${p.y}`).join(' ');
    return <polyline key={`route-${route.id}`} className={className} points={points} />;
  }
}
