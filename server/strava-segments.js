const stravaTracker = require('strava-live-segments/tracker')
const latLngMap = require('zwift-mobile-api/src/mapLatLong')

class StravaSegments {
    constructor(settings) {
        this.settings = settings
    }

    tracker(token, worldId, userSettings) {
        const startDate = this.getStartDate(userSettings);

        const world = worldId || 1
        const latLng = latLngMap[world]
        const config = {
            key: `world-${world}-${token}-${startDate}`,
            segments: this.settings.segments,
            startDate,
            map: point => {
                return latLng.toXY(point.lat + latLng.offset.lat, point.lng + latLng.offset.long)
            }
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

    activities(token, worldId, userSettings) {
        return this.tracker(token, worldId, userSettings)
            .activities()
            .then(activities => activities.map(activity => ({
                id: activity.id,
                name: activity.name,
                distanceInMeters: activity.distance,
                duration: `${Math.floor(activity.elapsed_time / 60)}:${activity.elapsed_time % 60}`,
                totalElevation: activity.total_elevation_gain,
                startDate: activity.start_date,
                avgWatts: activity.average_watts
            })));
    }

    activity(token, worldId, activityId, userSettings) {
        const tracker = this.tracker(token, worldId, userSettings);
        return Promise.all([tracker.activities(), tracker.activity(activityId)])
            .then((([activities, points]) => {
                const cached = activities.find(a => a.id == activityId);
                return {
                    id: activityId,
                    name: cached ? cached.name : 'Unknown',
                    positions: points
                }
            }))
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

    segments(token, worldId, segments, userSettings) {
        const segmentIDs = segments.split(',').map(s => parseInt(s));

        const tracker = this.tracker(token, worldId, userSettings);
        return Promise.all(
            segmentIDs.map(segmentId =>
                tracker.route(segmentId)
                    .then(positions => {
                        return {
                            id: segmentId,
                            positions
                        }
                    })
            )
        )
    }

    getRiderPosition(positions) {
        return positions ? positions.find(p => p.me) : null;
    }
}

module.exports = StravaSegments