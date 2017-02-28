import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';

class Analytics extends Component {
  static get propTypes() {
    return {
      profile: PropTypes.object.isRequired,
      ghosts: PropTypes.array,
      trackingId: PropTypes.string
    };
  }

  constructor(props) {
      super(props);
      this.state = {
          initialised: false
      }
      this.ga = window.ga;
  }

  componentDidMount() {
      this.initialise(this.props);
  }

  componentWillReceiveProps(props) {
      this.initialise(props);
  }

  initialise(props) {
    const { trackingId, profile } = props;
    if (trackingId && profile && profile.id) {
        if (!this.state.initialised) {
            this.ga('create', trackingId, 'auto', 'riderTracker', {
                userId: profile.id
            });
            this.setState({ initialised: true });
        }

        this.ga('riderTracker.send', 'pageview');

        if (this.props.profile && props.profile) {
            if (!!this.props.profile.riding !== !!props.profile.riding) {
                this.sendEvent({
                    eventCategory: 'Riding',
                    eventAction: props.profile.riding ? 'Started' : 'Stopped'
                });
            }
        }

        let wasGhosts = this.mapGhosts(this.props.ghosts);
        const newGhosts = this.mapGhosts(props.ghosts);
        newGhosts.forEach(g => {
            const index = wasGhosts.indexOf(g);
            if (index !== -1) {
                wasGhosts.splice(index, 1);
            } else {
                this.sendEvent({
                    eventCategory: 'Ghost',
                    eventAction: 'Added',
                    eventValue: g
                })
            }
        });

        wasGhosts.forEach(g => {
            this.sendEvent({
                eventCategory: 'Ghost',
                eventAction: 'Removed',
                eventValue: g
            })
        })
    }
  }

  mapGhosts(ghosts) {
    return ghosts ? ghosts.map(g => g.id) : []
  }

  sendEvent(eventSettings) {
    this.ga('riderTracker.send', 'event', eventSettings);
  }

  render() {
    return <div className="analytics" style={{display: 'none'}}></div>;
  }
	
}

const mapStateToProps = (state) => {
  return {
    profile: state.profile,
    ghosts: state.ghosts.ghosts,
    trackingId: state.environment.analytics.trackingId
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Analytics);
