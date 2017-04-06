const stravaTracker = require('strava-live-segments/tracker')
const latLngMap = require('zwift-mobile-api/src/mapLatLong')

class StravaSegments {
    constructor(settings) {
        this.settings = settings
    }

    get(token, worldId, positions) {
        const world = worldId || 1
        const lastLng = latLngMap[world]
        const config = {
            key: `world-${world}-${token}`,
            segments: this.settings.segments,
            map: point => {
                return lastLng.toXY(point.lat + lastLng.offset.lat, point.lng + lastLng.offset.long)
            }
        }

        const tracker = stravaTracker.get(token, config)
        return tracker.active(this.getRiderPosition(positions)).then(segments => {
            return {
                connected: !!token,
                segments
            }
        })
    }

    getRiderPosition(positions) {
        return positions.length > 0 ? positions[0] : {}
    }
}

module.exports = StravaSegments