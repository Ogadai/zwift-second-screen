import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { fetchStatus } from '../actions';

import s from './map.css';

import watopia from '../../maps/watopia.html';
import richmond from '../../maps/richmond.html';
import london from '../../maps/london.html';

const maps = {
  1: watopia,
  2: richmond,
	3: london
};

class Map extends Component {
  static get propTypes() {
    return {
      status: PropTypes.object,
			riding: PropTypes.bool.isRequired,
      world: PropTypes.number,
      onFetch: PropTypes.func.isRequired
    };
  }

  componentDidMount() {
    const { onFetch } = this.props;
    onFetch();
    this.fetchInterval = setInterval(onFetch, 2000);
  }

  componentWillUnmount() {
    clearInterval(this.fetchInterval);
  }

  render() {
    const { riding, world, status } = this.props;
    if (!riding) return <div className="map"><div className="not-riding">Not riding</div></div>

    return <div className="map">
      <div dangerouslySetInnerHTML={{ __html: maps[world] }}></div>
			<div>
        <svg id="map-riders" viewBox={this.getSvgParam('viewBox="')}>
          <g transform={'rotate' + this.getSvgParam('transform="rotate')}>
            <g transform={'translate' + this.getSvgParam('transform="translate')}>
								<g id="pois" className="pois">
                <circle id="rider" className="poi white_line" cx={status.x} cy={status.y} r="6000" stroke="black" strokeWidth="2000" fill="#ffffff"><title>rider</title></circle>
								</g>
							</g>
						</g>
					</svg>
				</div>
			</div>
  }

  getSvgParam(searchTerm) {
    const { world } = this.props;
    const map = maps[world];
    const pos = map.indexOf(searchTerm);
    if (pos !== -1) {
      const start = pos + searchTerm.length;
      const end = map.indexOf('"', start);
      return map.substring(start, end);
    }
    return '';
  }
}

const mapStateToProps = (state) => {
  return {
    riding: !!state.profile.riding,
    world: state.profile.worldId,
    status: state.status
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    onFetch: () => dispatch(fetchStatus())
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Map);
