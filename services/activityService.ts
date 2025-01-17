import { convertActivityToGpx } from '../utils/activityUtils'
import { writeGpxFile } from '../services/fileService'
import { uploadToStrava } from '../services/stravaService'
import { ActivityData } from '../types/types'


export const handleActivityUpload = async (activityData: ActivityData | null) => {
    if (!activityData) {
        throw new Error('No activity data provided')
    }

    const gpxData: string = convertActivityToGpx(activityData)
    const gpxFilePath: string = await writeGpxFile(gpxData)

    await uploadToStrava(gpxFilePath, activityData.id)

    return { activityData, gpxFilePath }
}
