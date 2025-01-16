import { LatLng } from 'react-native-maps'
import { AuthSessionResult, AuthRequest } from 'expo-auth-session'

export type RootStackParamList = {
    Home: undefined;
    MapScreen: { activityData: string }
}

export type DetailData = {
    timeStamp: number
    elevation: number
    frequency: number
    heartRate: number
    pace: number
}

export type GpsData = {
    timeStamp: number
    latitude: number
    longitude: number
    speed: number
}

export type FileData = {
    totalDistance: number
    avgSpeed: number
    avgHeartRate: number
    avgFrequency: number
    detailData: DetailData[]
    gpsData: GpsData[]
    sportType: number
    startTime: number
}

export type TrackPointExtension = {
    ele: number
    time: Date
    cad: number
    hr?: number
}

export type ActivityData = {
    startTime: number
    sportType: string
    totalDistance: number
    avgSpeed: number
    avgHeartRate: number
    avgFrequency: number
    waypoints: Waypoint[]
    startPoint: LatLng
    startTimeGps: number
    avgHeartRateDuringMissingGps: number
}

export type FormDataFile = {
    uri: string
    name: string
    type: string
}

export interface  Waypoint extends LatLng {
    timeStamp: Date
    elevation: number
    heartRate: number
    cadence: number
}

export type StravaAuthHook = {
    request: AuthRequest | null
    promptAsync: () => Promise<AuthSessionResult>
    isConnected: boolean
    isLoading: boolean
    disconnect: () => Promise<void>
}

export type HandleActivityUploadType = (
    previewEnabled: boolean,
    updatedActivityData?: ActivityData | null
) => Promise<{ activityData: ActivityData, gpxFilePath: string }>


export type LogParams = any[]
