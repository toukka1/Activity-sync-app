import axios from 'axios'
import { Alert } from 'react-native'
import { FormDataFile } from '../types/fileTypes'
const logger = require('../utils/logger')

const STRAVA_UPLOAD_URL = 'https://www.strava.com/api/v3/uploads'

export async function uploadToStrava(fileUri: string, accessToken: string): Promise<void> {
    try {
        const file: FormDataFile = {
            uri: fileUri,
            name: 'activity.gpx',
            type: 'application/gpx+xml',
        }

        const formData = new FormData()
        formData.append('file', file as unknown as Blob)
        formData.append('data_type', 'gpx')
        formData.append('activity_type', 'run')

        const response = await axios.post(STRAVA_UPLOAD_URL, formData, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'multipart/form-data',
            },
        })

        logger.info('GPX file uploaded successfully:', response.data)
        Alert.alert('Upload Success', 'Your activity has been successfully uploaded to Strava!')
    } catch (error) {
        logger.error('Error uploading GPX file to Strava:', error)
        Alert.alert('Upload Failed', 'There was an error uploading your activity to Strava. Please try again.')
    }
}
