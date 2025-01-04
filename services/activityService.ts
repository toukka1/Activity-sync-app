import { convertActivityToGpx } from '../utils/activityUtils'
import { pickAndParseFile, writeGpxFile } from '../services/fileService'
import { uploadToStrava } from '../services/stravaService'
import { ActivityData } from '../types/types'

export const handleActivityUpload = async (previewEnabled: boolean, updatedActivityData: ActivityData | null = null) => {
    const activityData = updatedActivityData ?? await pickAndParseFile()

    if (!activityData) {
        throw new Error('No activity data provided')
    }

    const gpxData = convertActivityToGpx(activityData)
    const gpxFilePath = await writeGpxFile(gpxData)

    if (!previewEnabled) {
        await uploadToStrava(gpxFilePath)
    }

    return { activityData, gpxFilePath }
}
