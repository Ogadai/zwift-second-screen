import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import s from './zoom.css';

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const WHEEL_RATE = 0.1;

class Zoom extends Component {
  static get propTypes() {
    return {
      defaultZoom: PropTypes.number,
      followSelector: PropTypes.string,
      onChangeZoomLevel: PropTypes.func
    };
  }

    constructor(props) {
        super(props)

        this.state = {
            scale: props.defaultZoom || 1,
            center: { x: 0.5, y: 0.5 },
            dragging: false,
            touchStart: {},
            touchLast: {},
            follow: true
        }
    }

    componentWillReceiveProps(props) {
        let { follow, scale } = this.state;

        if (props.defaultZoom && props.defaultZoom !== this.props.defaultZoom) {
            const center = (props.defaultZoom && props.defaultZoom !== 1)
                    ? { x: 0.45, y: 0.25 }
                    : { x: 0.5, y: 0.5 };
            scale = props.defaultZoom;
            follow = true;
            this.setZoom({ scale, center, follow });
        } else if (follow && scale > 1.1) {
            this.centerOnRider();
        }
    }

    render() {
        const { followSelector } = this.props;
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

            { followSelector ?
                <button className={classnames("app-button", "zoom-follow-btn", { hide: scale < 1.1, inactive: !follow })} onClick={() => this.clickFollow()}>
                    <span className="zwiftgps-icon icon-follow">&nbsp;</span>
                </button>
            : undefined }
        </div>
    }

    clickFollow() {
        const { follow } = this.state;
        const newFollow = !follow;

        this.setState({
            follow: newFollow
        });

        if (newFollow) {
            const followInterval = setInterval(() => {
                if (!this.state.follow) {
                    clearInterval(followInterval);
                } else {
                    this.centerOnRider();
                }
            }, 1000);
            this.centerOnRider();
        }
    }

    centerOnRider() {
        const { followSelector } = this.props;
        const elements = document.querySelectorAll(followSelector);
        if (elements && elements.length) {
            const lastElement = elements[elements.length - 1];
            const riderRect = lastElement.getBoundingClientRect();
            const mapRect = this.zoomElement.getBoundingClientRect();

            const center = {
                x: ((riderRect.left + riderRect.width / 2) - mapRect.left) / mapRect.width,
                y: ((riderRect.top + riderRect.height / 2) - mapRect.top) / mapRect.height
            };
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
        const { onChangeZoomLevel } = this.props;
        let { center, scale } = state;
        if (!center) center = this.state.center;
        if (!scale) scale = this.state.scale;

        if (scale < MIN_ZOOM) scale = MIN_ZOOM;
        if (scale > MAX_ZOOM) scale = MAX_ZOOM;

        if (center.y < (1 / scale) / 2) center.y = (1 / scale) / 2;
        if (center.y > 1 - (1 / scale) / 2) center.y = 1 - (1 / scale) / 2;
        if (center.x < (1 / scale) / 2) center.x = (1 / scale) / 2;
        if (center.x > 1 - (1 / scale) / 2) center.x = 1 - (1 / scale) / 2;

        this.setState(Object.assign({}, state, {
            center,
            scale
        }));

        if (onChangeZoomLevel) {
            onChangeZoomLevel(scale);
        }
    }
}

export default Zoom;
