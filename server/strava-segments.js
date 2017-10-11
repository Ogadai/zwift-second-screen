const stravaTracker = require('strava-live-segments/tracker')
const latLngMap = require('zwift-mobile-api/src/mapLatLong')

class StravaSegments {
    constructor(settings) {
        this.settings = settings
    }

    tracker(token, worldId, userSettings) {
        const startDate = this.getStartDate(userSettings);

        const world = worldId || 1
        const lastLng = latLngMap[world]
        const map = lastLng
            ? point => { return lastLng.toXY(point.lat + lastLng.offset.lat, point.lng + lastLng.offset.long) }
            : point => { return { x: point.lat, y: point.lng } }

        const config = {
            key: `world-${world}-${token}-${startDate}`,
            segments: this.settings.segments,
            startDate,
            map
        }

        return stravaTracker.get(token, config)
    }

    getStartDate(userSettings) {
        const subtractDays = days => {
            let theDate = new Date();
            theDate.setDate(theDate.getDate() - days);
            theDate.setHours(0, 0, 0, 0);
            return theDate.toISOString();
        };

        return userSettings
            ? (userSettings.startAge ? subtractDays(userSettings.startAge) : userSettings.startDate)
            : undefined;
    }

    get(token, worldId, positions, userSettings) {
        return new Promise(resolve => {
            return this.tracker(token, worldId, userSettings)
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
                        console.log(err.stack)
                    }

                    resolve({
                        connected: false
                    })
                })
        })
    }

    segmentEffort(token, worldId, segmentId, userSettings) {
        return this.tracker(token, worldId, userSettings)
            .effort(segmentId)
            .then(positions => {
                return {
                    id: segmentId,
                    positions
                }
            })
    }

    getRiderPosition(positions) {
        return positions ? positions.find(p => p.me) : null;
    }
}

module.exports = StravaSegments