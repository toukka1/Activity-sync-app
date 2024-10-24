import * as FileSystem from 'expo-file-system'
import { buildGPX, StravaBuilder } from 'gpx-builder'
import { isEmpty } from 'lodash'
const { Point, Metadata, Track, Segment } = StravaBuilder.MODELS
import { LatLng } from 'react-native-maps'
import { XMLParser } from 'fast-xml-parser'

import { getDirections } from '../services/mapboxService'
import { FileData, DetailData, GpsData, TrackPointExtension } from '../types/fileTypes'

const logger = require('./logger')


interface Waypoint extends LatLng {
    heartRate: number
    cadence: number
}

const opHealthFitnessTypes = new Map([
    [13, 'running']
])

function resolveSportType (numericSportType: number) {
    const result = opHealthFitnessTypes.get(numericSportType)
    return (result === undefined) ? 'Other' : result
}

export default async function convertOPHealthFileToGPX(file: FileData): Promise<string> {

    const firstValidPoint = file.gpsData[0]
    const lastPoint = file.gpsData[file.gpsData.length - 1]

    const totalRunDistance = file.totalDistance
    const startEndDistance = calculateDistance(firstValidPoint, lastPoint)

    // Threshold for loop detection (e.g., 20% of total run distance)
    const LOOP_DISTANCE_THRESHOLD_RATIO = 1

    let generatedTrackPoints: GpsData[]

    if (startEndDistance / totalRunDistance < LOOP_DISTANCE_THRESHOLD_RATIO) {
        // Assume the run is a loop and generate points based on that
        generatedTrackPoints = await generateCircularPathGpsData(firstValidPoint, lastPoint, file)
    } else {
        // Fall back to straight-line generation method
        //generatedTrackPoints = generateLinearPathPoints(firstValidPoint, file)
    }

    const trackPoints = file.detailData.map((data: DetailData): InstanceType<typeof Point> => {

        const point = file.gpsData.find((gpsPoint: GpsData) => Math.abs(gpsPoint.timeStamp - data.timeStamp) <= 2)

        let trackPoint: InstanceType<typeof Point>

        const extension: TrackPointExtension = {
            ele: data.elevation / 10,
            time: new Date(data.timeStamp * 1000),
            cad: data.frequency / 2,
            hr: data.heartRate
        }

        if (!isEmpty(point)) {
            trackPoint = new Point(point.latitude, point.longitude, extension)
        } else {
            // Use generated data for missing points
            const generatedPoint = generatedTrackPoints.find(g => Math.abs(g.timeStamp - data.timeStamp) <= 2)
            if (generatedPoint) {
                trackPoint = new Point(generatedPoint.latitude, generatedPoint.longitude, extension)
            } else {
                trackPoint = new Point(0, 0, extension) // Fallback if no data found
            }
        }

        return trackPoint
    }).filter(a => a !== undefined)

    const tracks = [new Track([new Segment(trackPoints)], {
        type: resolveSportType(file.sportType)
    })]

    const gpxData = new StravaBuilder()
    gpxData.setTracks(tracks)
    gpxData.setMetadata(new Metadata({
        name: 'Run',
        time: new Date(file.startTime * 1000),
        desc: 'OnePlus Watch activity'
    }))

    return buildGPX(gpxData.toObject())
}

async function generateCircularPathGpsData(firstPoint: GpsData, lastPoint: GpsData, file: FileData): Promise<GpsData[]> {
    try {
        // Call Mapbox API to get the route between lastPoint and firstPoint
        const coordinates = await getDirections(lastPoint.longitude, lastPoint.latitude, firstPoint.longitude, firstPoint.latitude)

        // Calculate the total missing distance (based on timestamps and pace)
        const missingDistance = calculateMissingDistance(file)

        // Backtrack along the coordinates, summing up distances until we've covered the missing distance
        let accumulatedDistance = 0
        let backtrackedGpsData: GpsData[] = []

        for (let i = coordinates.length - 2; i >= 0; i--) {
            const [currentLon, currentLat] = coordinates[i]
            const [nextLon, nextLat] = coordinates[i + 1]

            const distanceBetweenPoints = calculateDistance({ longitude: currentLon, latitude: currentLat }, { longitude: nextLon, latitude: nextLat })
            accumulatedDistance += distanceBetweenPoints

            if (accumulatedDistance >= missingDistance) {
                break  // Stop once we've covered the missing distance
            }

            // Calculate timestamp for this generated point based on index and the known time interval
            const timeStamp = firstPoint.timeStamp - (accumulatedDistance * file.avgSpeed / 1000)

            backtrackedGpsData.push({
                timeStamp,
                latitude: currentLat,
                longitude: currentLon,
                speed: 0
            })
        }

        return backtrackedGpsData
    } catch (error) {
        console.error('Error generating circular path GPS data:', error)
        throw error
    }
}

// Calculate the distance that should have been covered based on missing timestamps and pace
function calculateMissingDistance(file: FileData): number {

    const firstGpsTimestamp = file.gpsData[0].timeStamp
    const firstDetailTimestamp = file.detailData[0].timeStamp

    // Calculate the time difference between the first detail point and the first GPS-acquired point
    const timeDifference = firstGpsTimestamp - firstDetailTimestamp

    // Calculate the average of the first few non-zero paces
    const averagePace = file.avgSpeed
    const paceInKmPerSecond = 1 / averagePace

    // Calculate distance covered using the pace and time difference (in meters)
    const distanceCovered = timeDifference * paceInKmPerSecond * 1000

    return distanceCovered
}

export function calculateTotalDistance(points: LatLng[]): number {
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
export function calculateBoundingBox(coordinates: LatLng[]) {
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

export async function parseGPXFile(gpxFileUri: string | null): Promise<Waypoint[]> {
    if (!gpxFileUri) return []

    try {
        const gpxData = await FileSystem.readAsStringAsync(gpxFileUri)

        const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: '@_',
        })

        const parsedData = parser.parse(gpxData)

        const waypoints: Waypoint[] = parsedData.gpx.trk.trkseg.trkpt.map((point: any) => ({
            latitude: parseFloat(point["@_lat"]),
            longitude: parseFloat(point["@_lon"]),
            time: point.time,
            heartRate: point.extensions["gpxtpx:TrackPointExtension"]["gpxtpx:hr"] || 0,
            cadence: point.extensions["gpxtpx:TrackPointExtension"]["gpxtpx:cad"] || 0,
        }))

        return waypoints
    } catch (error) {
        console.error('Error parsing GPX file:', error)
        return []
    }
}
