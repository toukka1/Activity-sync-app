import { LatLng } from 'react-native-maps'

export interface DetailData {
    timeStamp: number
    elevation: number
    frequency: number
    heartRate: number
    pace: number
}

export interface GpsData {
    timeStamp: number
    latitude: number
    longitude: number
    speed: number
}

export interface FileData {
    totalDistance: number
    avgSpeed: number
    detailData: DetailData[]
    gpsData: GpsData[]
    sportType: number
    startTime: number
}

export interface TrackPointExtension {
    ele: number
    time: Date
    cad: number
    hr?: number
}

export interface FormDataFile {
    uri: string
    name: string
    type: string
}

export interface Waypoint extends LatLng {
    heartRate: number
    cadence: number
}

export type LogParams = any[]
