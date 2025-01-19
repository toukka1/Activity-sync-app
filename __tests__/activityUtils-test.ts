import {
    calculateBoundingBox,
    calculateDistance,
    calculateTotalDistance,
    parseOPHealthData,
} from '../utils/activityUtils'
import { FileData, Waypoint } from '../types/types'

jest.mock('gpx-builder', () => ({
    buildGPX: jest.fn(() => '<gpx>mock content</gpx>'),
    StravaBuilder: {
        MODELS: {
            Point: jest.fn(),
            Metadata: jest.fn(),
            Track: jest.fn(),
            Segment: jest.fn()
        },
        default: jest.fn().mockImplementation(() => ({
            setTracks: jest.fn(),
            setMetadata: jest.fn(),
            toObject: jest.fn().mockReturnValue({})
        }))
    }
}))

describe('activityUtils', () => {
    describe('calculateDistance', () => {
        it('calculates distance between two points using the Haversine formula', () => {
            const point1 = { latitude: 60.1699, longitude: 24.9384 }
            const point2 = { latitude: 60.2055, longitude: 24.6559 }

            const distance = calculateDistance(point1, point2)

            expect(distance).toBeGreaterThan(0)
        })

        it('returns 0 for the same point', () => {
            const point = { latitude: 60.1699, longitude: 24.9384 }

            const distance = calculateDistance(point, point)

            expect(distance).toBe(0)
        })
    })

    describe('calculateTotalDistance', () => {
        it('calculates the total distance for an array of waypoints', () => {
            const waypoints: Waypoint[] = [
                { latitude: 60.1699, longitude: 24.9384, timeStamp: 1635700800000, elevation: 50, heartRate: 150, cadence: 80 },
                { latitude: 60.2055, longitude: 24.6559, timeStamp: 1635700800000, elevation: 50, heartRate: 150, cadence: 80 },
                { latitude: 60.2215, longitude: 24.8039, timeStamp: 1635700800000, elevation: 50, heartRate: 150, cadence: 80 }
            ]

            const totalDistance = calculateTotalDistance(waypoints)

            expect(totalDistance).toBeGreaterThan(0)
        })

        it('returns 0 for an empty array', () => {
            const totalDistance = calculateTotalDistance([])

            expect(totalDistance).toBe(0)
        })
    })

    describe('calculateBoundingBox', () => {
        it('calculates the bounding box for given waypoints', () => {
            const waypoints: Waypoint[] = [
                { latitude: 60.1699, longitude: 24.9384, timeStamp: 1635700800000, elevation: 50, heartRate: 150, cadence: 80 },
                { latitude: 60.2055, longitude: 24.6559, timeStamp: 1635700800000, elevation: 50, heartRate: 150, cadence: 80 },
                { latitude: 60.2215, longitude: 24.8039, timeStamp: 1635700800000, elevation: 50, heartRate: 150, cadence: 80 }
            ]

            const boundingBox = calculateBoundingBox(waypoints)

            expect(boundingBox.latitudeDelta).toBeGreaterThan(0)
            expect(boundingBox.longitudeDelta).toBeGreaterThan(0)
            expect(boundingBox.centerLatitude).toBeGreaterThan(0)
            expect(boundingBox.centerLongitude).toBeGreaterThan(0)
        })
    })

    describe('parseOPHealthData', () => {
        it('parses file data into activity data', async () => {
            const mockFile: FileData = {
                gpsData: [{ latitude: 60.1699, longitude: 24.9384, timeStamp: 1635700800, speed: 10 }],
                detailData: [
                    { timeStamp: 1635700800, heartRate: 150, frequency: 80, elevation: 500, pace: 5 }
                ],
                startTime: 1635700800,
                totalTime: 3600,
                sportType: 13,
                totalDistance: 10000,
                avgSpeed: 10,
                avgHeartRate: 150,
                avgFrequency: 80
            }

            const activity = await parseOPHealthData(mockFile)

            expect(activity.sportType).toBe('running')
            expect(activity.startTime).toBe(1635700800000)
            expect(activity.waypoints.length).toBe(1)
        })

        it('throws an error if GPS or detail data is missing', async () => {
            const mockFile: FileData = {
                gpsData: [],
                detailData: [],
                startTime: 0,
                totalTime: 0,
                sportType: 0,
                totalDistance: 0,
                avgSpeed: 0,
                avgHeartRate: 0,
                avgFrequency: 0
            }

            await expect(parseOPHealthData(mockFile)).rejects.toThrow(
                'GPS or detail data missing in the provided file.'
            )
        })
    })
})

