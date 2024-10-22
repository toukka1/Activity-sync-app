import * as FileSystem from 'expo-file-system'
import { buildGPX, StravaBuilder } from 'gpx-builder'
import { isEmpty } from 'lodash'
const { Point, Metadata, Track, Segment } = StravaBuilder.MODELS
import { LatLng } from 'react-native-maps'
import { XMLParser } from 'fast-xml-parser'

import { FileData, DetailData, GpsData, TrackPointExtension } from '../types/fileTypes'


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
    let count = 0
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
            count++
            trackPoint = new Point(point.latitude, point.longitude, extension)
        } else
            trackPoint = new Point(0, 0, extension)

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
