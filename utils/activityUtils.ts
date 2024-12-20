import { buildGPX, StravaBuilder } from 'gpx-builder'
const { Point, Metadata, Track, Segment } = StravaBuilder.MODELS
import { LatLng } from 'react-native-maps'

import { getDirections } from '../services/mapboxService'
import { FileData, DetailData, GpsData, TrackPointExtension, Waypoint, ActivityData } from '../types/types'

import logger from './logger'


const opHealthFitnessTypes = new Map([
    [1, 'walking'],
    [3, 'biking'],
    [13, 'running']
])

function resolveSportType (numericSportType: number) {
    const result = opHealthFitnessTypes.get(numericSportType)
    return (result === undefined) ? 'Other' : result
}

export default async function parseOPHealthFile(file: FileData): Promise<ActivityData> {

    if (!file.gpsData || file.gpsData.length === 0 || !file.detailData || file.detailData.length == 0) {
        throw new Error('GPS or detail data missing in the provided file.')
    }

    let missingGpsHeartRateSum = 0
    let missingGpsHeartRateCount = 0

    const waypoints: Waypoint[] = file.detailData
    .flatMap((data: DetailData): Waypoint[] => {
        const point = file.gpsData.find(
            (gpsPoint: GpsData) => Math.abs(gpsPoint.timeStamp - data.timeStamp) <= 2
        )

        if (!point) {
            // Extract the heart rate for the duration where gps data isn't available
            missingGpsHeartRateSum += data.heartRate !== 0 ? data.heartRate : file.avgHeartRate
            missingGpsHeartRateCount++
            return []
        }

        return [{
            latitude: point.latitude,
            longitude: point.longitude,
            timeStamp: new Date(data.timeStamp * 1000),
            elevation: data.elevation / 10,
            heartRate: data.heartRate !== 0 ? data.heartRate : file.avgHeartRate,
            cadence: data.frequency / 2,
        }]
    })

    const avgHeartRateDuringMissingGps = missingGpsHeartRateCount > 0
        ? missingGpsHeartRateSum / missingGpsHeartRateCount
        : 0

    const activityData: ActivityData = {
        startTime: file.startTime * 1000,
        sportType: resolveSportType(file.sportType),
        totalDistance: file.totalDistance,
        avgSpeed: file.avgSpeed,
        avgHeartRate: file.avgHeartRate,
        avgFrequency: file.avgFrequency,
        waypoints: waypoints,
        startPoint: {latitude: file.gpsData[0].latitude, longitude: file.gpsData[0].longitude},
        startTimeGps: file.gpsData[0].timeStamp * 1000,
        avgHeartRateDuringMissingGps: avgHeartRateDuringMissingGps
    }

    return activityData
}

export async function updateActivityWithNewStartPoint(activityData: ActivityData,
    newStartPoint: { latitude: number; longitude: number })
: Promise<Waypoint[]> {
    try {
        // Call Mapbox Directions API to get the route between the newStartPoint and original start point
        const route = await getDirections(
            newStartPoint.longitude,
            newStartPoint.latitude,
            activityData.startPoint.longitude,
            activityData.startPoint.latitude
        )

        // Split the elapsed time during no gps data evenly for the new calculated route
        const interval = (activityData.startTimeGps - activityData.startTime) / route.length

        const newWaypoints: Waypoint[] = route.map((point, index) => ({
            latitude: point[1],
            longitude: point[0],
            timeStamp: new Date((activityData.startTime + interval * index)),
            elevation: 0,
            heartRate: activityData.avgHeartRateDuringMissingGps,
            cadence: activityData.avgFrequency / 2,
        }))

        const updatedWaypoints = [...newWaypoints, ...activityData.waypoints]

        return updatedWaypoints
        
    } catch (error) {
        logger.error('Failed to update activity with new starting point:', error)
        throw error
    }
}

export function convertActivityToGpx(activity: ActivityData): string {
    const trackPoints = activity.waypoints.map((waypoint: Waypoint): InstanceType<typeof Point> => {
        
        let trackPoint: InstanceType<typeof Point>

        const extension: TrackPointExtension = {
            ele: waypoint.elevation,
            time: waypoint.timeStamp,
            cad: waypoint.cadence,
            hr: waypoint.heartRate
        }

        trackPoint = new Point(waypoint.latitude, waypoint.longitude, extension)

        return trackPoint
    })

    const tracks = [new Track([new Segment(trackPoints)], {
        type: activity.sportType
    })]

    const gpxData = new StravaBuilder()
    gpxData.setTracks(tracks)
    gpxData.setMetadata(new Metadata({
        name: 'Run',
        time: new Date(activity.startTime),
        desc: 'OnePlus Watch activity'
    }))

    return buildGPX(gpxData.toObject())
}

export function calculateTotalDistance(points: Waypoint[]): number {
    let totalDistance = 0
    const validPoints = points.filter(point => point.latitude !== 0 && point.longitude !== 0)

    for (let i = 1; i < validPoints.length; i++) {
        totalDistance += calculateDistance(validPoints[i - 1], validPoints[i])
    }

    return totalDistance
}

// Calculate the distance between two points using the Haversine formula
export function calculateDistance(point1: LatLng, point2: LatLng): number {
    const R = 6371e3 // Radius of Earth in meters
    const lat1 = point1.latitude * Math.PI / 180
    const lat2 = point2.latitude * Math.PI / 180
    const deltaLat = (point2.latitude - point1.latitude) * Math.PI / 180
    const deltaLon = (point2.longitude - point1.longitude) * Math.PI / 180

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c // Distance in meters
}

// Calculate the bounding box that contains all valid points
export function calculateBoundingBox(coordinates: Waypoint[]) {
    const lats = coordinates.map(coord => coord.latitude)
    const lons = coordinates.map(coord => coord.longitude)

    const minLat = Math.min(...lats)
    const maxLat = Math.max(...lats)
    const minLon = Math.min(...lons)
    const maxLon = Math.max(...lons)

    return {
        latitudeDelta: maxLat - minLat + 0.01,
        longitudeDelta: maxLon - minLon + 0.01,
        centerLatitude: (minLat + maxLat) / 2,
        centerLongitude: (minLon + maxLon) / 2
    }
}
