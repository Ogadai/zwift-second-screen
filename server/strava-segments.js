const stravaTracker = require('strava-live-segments/tracker')
const latLngMap = require('zwift-mobile-api/src/mapLatLong')

class StravaSegments {
    constructor(settings) {
        this.settings = settings
    }

    tracker(token, worldId) {
        const world = worldId || 1
        const lastLng = latLngMap[world]
        const config = {
            key: `world-${world}-${token}`,
            segments: this.settings.segments,
            map: point => {
                return lastLng.toXY(point.lat + lastLng.offset.lat, point.lng + lastLng.offset.long)
            }
        }

        return stravaTracker.get(token, config)
    }

    get(token, worldId, positions) {
        return new Promise(resolve => {
            return this.tracker(token, worldId)
                .active(this.getRiderPosition(positions)).then(segments => {
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

    segmentEffort(token, worldId, segmentId) {
        return this.tracker(token, worldId)
            .effort(segmentId)
            .then(positions => {
                return {
                    id: segmentId,
                    positions
                }
            })
    }

    getRiderPosition(positions) {
        return positions.length > 0 ? positions[0] : {}
    }
}

module.exports = StravaSegments