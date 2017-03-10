import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';

import s from './zoom.css';

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const WHEEL_RATE = 0.1;

class Zoom extends Component {
  static get propTypes() {
    return {
      positions: PropTypes.array,
      mapSettings: PropTypes.object,
      showingGhosts: PropTypes.bool
    };
  }

    constructor(props) {
        super(props)

        this.state = {
            scale: 1,
            center: {
                x: 0.5,
                y: 0.5
            },
            dragging: false,
            touchStart: {},
            touchLast: {},
            follow: false
        }
    }

    componentWillReceiveProps(props) {
        const { follow, scale } = this.state;
        if (follow && scale > 1.1) {
            this.centerOnRider(props);
        }
    }

    render() {
        const { scale, center, follow } = this.state;
        const scalePercent = scale * 100;

        const style = {
            width: `${scalePercent}%`,
            height: `${scalePercent}%`,
            top: `${50 - center.y * scale * 100}%`,
            left: `${50 - center.x * scale * 100}%`
        };
        return <div className="zoom-container">
            <div className="zoom-area" style={style} ref={input => { this.zoomElement = input; }}
                        onWheel={e => this.onWheel(e)}
                        onMouseDown={e => this.onMouseDown(e)}
                        onMouseUp={e => this.onMouseUp(e)}
                        onMouseMove={e => this.onMouseMove(e)}
                        onTouchStart={e => this.onTouchStart(e)}
                        onTouchEnd={e => this.onTouchEnd(e)}
                        onTouchMove={e => this.onTouchMove(e)}
                        onTouchCancel={e => this.onTouchCancel(e)}
                    >
                {this.props.children}
            </div>
            <button className={classnames("zoom-follow-btn", { hide: scale < 1.1 || this.props.showingGhosts, inactive: !follow })} onClick={() => this.clickFollow()}>
                <img src="/img/target.png" />
            </button>
        </div>
    }

    clickFollow() {
        const { follow } = this.state;

        this.setState({
            follow: !follow
        });
        this.centerOnRider(this.props);
    }

    centerOnRider(props) {
        const { positions, mapSettings } = this.props;
        let [ left, top, width, height ] = mapSettings.viewBox.split(' ');
        const { clientWidth, clientHeight } = this.zoomElement;
        const rotate = mapSettings.rotate && (parseInt(mapSettings.rotate.substring(1)) !== 0);

        if ((width / height) < (clientWidth / clientHeight)) {
            // Increase width
            const newWidth = height * (clientWidth / clientHeight);
            left -= (newWidth - width) / 2;
            width = newWidth;
        } else {
            // Increase height
            const newHeight = width / (clientWidth / clientHeight);
            top -= (newHeight - height);
            height = newHeight;
        }

        if (positions && positions.length > 0) {
            const position = positions[0];
            let center;
            if (rotate) {
                center = {
                    x: (position.y - left) / width,
                    y: 1 - ((position.x - top) / height)
                }
            } else {
                center = {
                    x: (position.x - left) / width,
                    y: (position.y - top) / height
                }
            }

            this.setZoom({ center });
        }
    }

    onWheel(event) {
        const { scale } = this.state;
        const dir = event.deltaY < 0 ? 1 : -1;
        const newScale = scale + dir * scale * WHEEL_RATE;
        
        this.setZoom({ scale: newScale, follow: false });
    }

    onMouseDown(event) {
        this.start(this.fromMouseEvent(event))
        event.preventDefault();
    }
    onMouseUp(event) {
        this.end(this.fromMouseEvent(event))
        event.preventDefault();
    }
    onMouseMove(event) {
        if (this.state.dragging) {
            if (event.buttons === 0) {
                this.end();
            } else {
                this.move(this.fromMouseEvent(event))
            }
        }
        event.preventDefault();
    }

    fromMouseEvent(event) {
        return {
            points: [{ x: event.clientX, y: event.clientY }]
        };
    }

    onTouchStart(event) {
        this.start(this.fromTouchEvent(event))
    }
    onTouchEnd(event) {
        this.end(this.fromTouchEvent(event))
    }
    onTouchMove(event) {
        this.move(this.fromTouchEvent(event))
    }
    onTouchCancel(event) {
        this.end(this.fromTouchEvent(event))
    }

    fromTouchEvent(event) {
        const points = [];
        for(let n = 0; n < event.touches.length; n++) {
            const { clientX, clientY } = event.touches[n];
            points.push({ x: clientX, y: clientY });
        }

        return {
            points
        }
    }

    start(details) {
        const { clientWidth, clientHeight } = this.zoomElement;
        this.screenSize = {
            width: clientWidth,
            height: clientHeight
        }

        this.setState({
            touchStart: details,
            touchLast: details,
            dragging: true
        });
    }

    move(details) {
        const from = this.getCenter(this.state.touchLast);
        const to = this.getCenter(details);

        const { center, scale } = this.state;

        const newCenter = {
            x: center.x - (to.x - from.x),
            y: center.y - (to.y - from.y)
        };

        const newScale = from.spread && to.spread
                ? scale * (to.spread / from.spread)
                : scale;

        this.setZoom({
            center: newCenter,
            scale: newScale,
            touchLast: details,
            follow: false
        });
    }

    end(details) {
        this.setState({
            touchStart: {},
            touchLast: {},
            dragging: false
        });
    }

    getCenter(touch) {
        const { points } = touch;
        const { width, height } = this.screenSize;

        return {
            x: (points.reduce((sum, p) => (sum + p.x), 0) / points.length) / width,
            y: (points.reduce((sum, p) => (sum + p.y), 0) / points.length) / height,
            spread: this.getSpread(touch)
        }
    }

    getSpread(touch) {
        const { points } = touch;
        const { width, height } = this.screenSize;
        
        let maxDist = 0;
        for(let n = 0; n < points.length - 1; n++) {
            for(let m = n + 1; m < points.length; m++) {
                const p1 = points[n],
                      p2 = points[m];
                
                const dist = Math.sqrt( Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2) );
                maxDist = Math.max(maxDist, dist);
            }
        }
        return maxDist;
    }

    setZoom(state) {
        let { center, scale } = state;
        if (!center) center = this.state.center;
        if (!scale) scale = this.state.scale;

        if (scale < MIN_ZOOM) scale = MIN_ZOOM;
        if (scale > MAX_ZOOM) scale = MAX_ZOOM;

        if (center.y < (1 / scale) / 2) center.y = (1 / scale) / 2;
        if (center.y > 1 - (1 / scale) / 2) center.y = 1 - (1 / scale) / 2;
        if (center.x < (1 / scale) / 2) center.x = (1 / scale) / 2;
        if (center.x > 1 - (1 / scale) / 2) center.x = 1 - (1 / scale) / 2;

        if (this.state.scale === 1 && scale > 1) {
            this.enterFullScreen();
        } else if (this.state.scale > 1 && scale === 1) {
            this.exitFullScreen();
        }

        this.setState(Object.assign({}, state, {
            center,
            scale
        }));
    }

    enterFullScreen() {
        var docEl = window.document.documentElement;
        var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
        try {
            if (requestFullScreen) requestFullScreen.call(docEl);
        } catch(ex) {
            console.log(`error trying to enter full screen - ${ex.message}`);
        }
    }

    exitFullScreen() {
        var doc = window.document;
        var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
        try {
            if (cancelFullScreen) cancelFullScreen.call(doc);
        } catch(ex) {
            console.log(`error trying to enter full screen - ${ex.message}`);
        }
    }
}

const mapStateToProps = (state) => {
  return {
    positions: state.world.positions,
    mapSettings: state.mapSettings,
    showingGhosts: state.ghosts.show
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Zoom);
