import { buildGPX, StravaBuilder } from 'gpx-builder'
import { isEmpty } from 'lodash'
import { FileData, DetailData, GpsData, TrackPointExtension } from '../types/fileTypes'
const { Point, Metadata, Track, Segment } = StravaBuilder.MODELS


const opHealthFitnessTypes = new Map([
    [13, 'running']
  ])
  
function resolveSportType (numericSportType: number) {
  const result = opHealthFitnessTypes.get(numericSportType)
  return (result === undefined) ? 'Other' : result
}

async function convertOPHealthFileToGPX (file: FileData): Promise<string> {
  const trackPoints = file.detailData.map((data: DetailData): InstanceType<typeof Point> => {
    const point = file.gpsData.find((el: GpsData) => el.timeStamp === data.timeStamp)
    let trackPoint: InstanceType<typeof Point>

    if (!isEmpty(point)) {
      const extension: TrackPointExtension = {
        ele: data.elevation / 10,
        time: new Date(point.timeStamp * 1000),
        cad: data.frequency / 2,
        hr: data.heartRate !== 0 ? data.heartRate : undefined
      }
      trackPoint = new Point(point.latitude, point.longitude, extension)
    } else
      trackPoint = new Point(0, 0, {
        time: new Date(data.timeStamp * 1000),
        hr: data.heartRate
      })

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

export { convertOPHealthFileToGPX }
