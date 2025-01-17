import axios from 'axios'
import { Alert } from 'react-native'

import { getAccessToken } from './authService'
import { FormDataFile } from '../types/types'

import logger from '../utils/logger'

const STRAVA_UPLOAD_URL = 'https://www.strava.com/api/v3/uploads'
const STRAVA_ACTIVITIES_URL = 'https://www.strava.com/api/v3/athlete/activities'

export async function uploadToStrava(fileUri: string, id: string): Promise<void> {
    try {

        const accessToken: string | null = await getAccessToken()
        if (!accessToken) {
            throw new Error('Access token not found.')
        }

        const file: FormDataFile = {
            uri: fileUri,
            name: id,
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

export async function fetchStravaActivities(): Promise<string[]> {
    try {
        const accessToken: string | null = await getAccessToken()
        if (!accessToken) {
            throw new Error('Access token not found')
        }

        const perPage = 50
        let page = 1
        let hasMoreActivities = true
        const externalIds: string[] = []

        while (hasMoreActivities) {
            const response = await axios.get(STRAVA_ACTIVITIES_URL, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                },
                params: {
                    per_page: perPage,
                    page: page
                }
            })

            const activities = response.data

            // Extract external IDs and add them to the array
            activities.forEach((activity: any) => {
                if (activity.external_id) {
                    externalIds.push(activity.external_id)
                }
            })

            // Check if there are more activities
            if (activities.length < perPage) {
                hasMoreActivities = false
            } else {
                page += 1
            }
        }

        logger.info('All external IDs fetched:', externalIds.length)
        logger.info(externalIds)
        return externalIds
    } catch (error) {
        logger.error('Error fetching activities from Strava:', error)
        return []
    }
}
