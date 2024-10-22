export interface DetailData {
  timeStamp: number;
  elevation: number;
  frequency: number;
  heartRate: number;
}

export interface GpsData {
  timeStamp: number;
  latitude: number;
  longitude: number;
  speed: number;
}

export interface FileData {
  detailData: DetailData[];
  gpsData: GpsData[];
  sportType: number;
  startTime: number;
}

export interface TrackPointExtension {
  ele: number;
  time: Date;
  cad: number;
  hr?: number;
}

export interface FormDataFile {
    uri: string
    name: string
    type: string
}

export type LogParams = any[]
