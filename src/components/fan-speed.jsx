import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Slider from 'react-slider';
import classnames from 'classnames';

import { fetchFanSpeed, setFanSpeed } from '../actions';

class FanSpeed extends Component {
  static get propTypes() {
    return {
      fanSpeed: PropTypes.object.isRequired,
			disabled: PropTypes.bool,
      onFetch: PropTypes.func.isRequired,
      onSet: PropTypes.func.isRequired
    };
  }

  componentDidMount() {
    this.props.onFetch();
  }

  render() {
    const { fanSpeed, disabled, onSet } = this.props;
    return (
      <div className={classnames("fan-speed", this.getFanClass(fanSpeed.fan), { disabled })}>
        <Slider
          min={0}
					max={75}
					value={fanSpeed.speed}
          onChange={onSet}
          orientation="vertical"
          disabled={disabled}
					/>
			</div>
    )
  }

  getFanClass(fan) {
    const speedClass = Math.round(fan * 10);
    return `fan-${speedClass}`;
  }

}

const mapStateToProps = (state) => {
  return {
    fanSpeed: state.fanSpeed,
		disabled: !!state.profile.riding
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    onFetch: () => dispatch(fetchFanSpeed()),
    onSet: speed => dispatch(setFanSpeed(speed))
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FanSpeed);
