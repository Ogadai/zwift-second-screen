const tracker = require('strava-live-segments/tracker')
const latLngMap = require('zwift-mobile-api/src/mapLatLong')

const config = {
    map: point => latLngMap[1].toXY(point.lat + latLngMap[1].offset.lat, point.lng + latLngMap[1].offset.long)
}


class StravaSegments {
    constructor(settings) {

    }

    get(token, worldId, positions) {
        return Promise.resolve({ connected: !!token })
    }
}

module.exports = StravaSegments