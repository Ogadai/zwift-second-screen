const stravaTracker = require('strava-live-segments/tracker')
const latLngMap = require('zwift-mobile-api/src/mapLatLong')

class StravaSegments {
    constructor(settings) {
        this.settings = settings
    }

    get(token, worldId, positions) {
        return new Promise(resolve => {
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
            .then(result => resolve(result))
            .catch(err => {
                if (err.response) {
                    console.log(`Failed strava data: ${err.response.status} - ${err.response.statusText}`)
                } else {
                    console.log(`Failed strava data: ${err.message}`)
                }

                resolve({
                    connected: false
                })
            })
        })
    }

    getRiderPosition(positions) {
        return positions.length > 0 ? positions[0] : {}
    }
}

module.exports = StravaSegments