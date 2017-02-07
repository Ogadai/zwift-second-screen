import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';

import Summary from './summary';
import Map from './map';

import s from './app.css';

class App extends Component {
  static get propTypes() {
    return {
      overlay: PropTypes.bool
    };
  }

  constructor(props) {
    super(props);

    this.state = {
			hovering: false
    };
  }

  render() {
    const { overlay } = this.props;
    const { hovering } = this.state;

    return (
      <div className={classnames("zwift-app", { overlay, hovering })}>
        <h1 className="title-bar">Zwift GPS</h1>
        <div className="content" onMouseMove={() => this.onMouseMove()}>
					<Summary />
					<Map />
				</div>
      </div>
    )
  }

  onMouseMove() {
    if (this.mouseMoveTimeout) {
      clearTimeout(this.mouseMoveTimeout);
    }

    this.setState({
			hovering: true
    });
    this.mouseMoveTimeout = setTimeout(() => {
      this.setState({
        hovering: false
      });
      this.mouseMoveTimeout = null;
    }, 3000);
  }
}

const mapStateToProps = (state) => {
  return {
    overlay: state.environment.electron
  }
}

const mapDispatchToProps = (dispatch) => {
  return {

  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
