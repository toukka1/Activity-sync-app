import AsyncStorage from '@react-native-async-storage/async-storage'

import { convertActivityToGpx } from '../utils/activityUtils'
import { writeGpxFile } from '../services/fileService'
import { uploadToStrava, fetchStravaActivities } from '../services/stravaService'
import { ActivityData } from '../types/types'

import logger from '../utils/logger'


export async function handleActivityUpload(activityData: ActivityData) {
    if (activityData.isSynced) return

    try {
        const gpxData: string = convertActivityToGpx(activityData)
        const gpxFilePath: string = await writeGpxFile(gpxData)

        await uploadToStrava(gpxFilePath, activityData.id)
        await saveActivityIdToCache(activityData.id)
    }catch (error) {
        logger.error('Error uploading activity to Strava:', error)
        throw new Error('Error uploading activity to Strava.')
    }
}

export async function handleMultipleActivityUpload(activities: ActivityData[]) {
    try {
        for (const activity of activities) {
            await handleActivityUpload(activity)
        }
        await refreshCachedActivityIds()
    } catch (error) {
        logger.error('Error uploading activities to Strava:', error)
        throw new Error('Error uploading activities to Strava.')
    }
}

async function saveActivityIdsToCache(activityIds: string[]) {
    try {
        const idsString = JSON.stringify(activityIds)
        await AsyncStorage.setItem('cached_activity_ids', idsString)
    } catch (error) {
        logger.error('Failed to cache activity IDs:', error)
        throw new Error('Failed to cache activity IDs.')
    }
}

export async function saveActivityIdToCache(activityId: string) {
    try {
        const cachedIds = await loadActivityIdsFromCache()
        cachedIds.add(activityId)
        await saveActivityIdsToCache(Array.from(cachedIds))
    } catch (error) {
        logger.error('Failed to cache activity ID:', error)
        throw new Error('Failed to cache activity ID.')
    }
}

// Load activity IDs from cache and convert to a Set
async function loadActivityIdsFromCache(): Promise<Set<string>> {
    try {
        const idsString = await AsyncStorage.getItem('cached_activity_ids')
        if (idsString) {
            const activityIds: string[] = JSON.parse(idsString)
            logger.info('Loaded activity IDs from cache:', activityIds)
            return new Set(activityIds)
        } else {
            logger.info('No activity IDs found in cache')
            return new Set()
        }
    } catch (error) {
        logger.error('Failed to load activity IDs from cache:', error)
        throw new Error('Failed to load activity IDs from cache.')
    }
}

export async function getSyncedActivityIds(): Promise<Set<string>> {
    try {
        let cachedIds: Set<string> = await loadActivityIdsFromCache()
        let fetchedIds: string[] = []

        if (cachedIds.size === 0) {
            fetchedIds = await fetchStravaActivities()
            await saveActivityIdsToCache(fetchedIds)
        }

        // Return fetched or cached IDs (one will be empty)
        const ids = new Set([...cachedIds, ...fetchedIds])
        return ids
    } catch (error) {
        logger.error('Error in fetching activity ids:', error)
        return await loadActivityIdsFromCache()
    }
}

async function refreshCachedActivityIds(): Promise<Set<string>> {
    try {
        const fetchedIds = await fetchStravaActivities()
        await saveActivityIdsToCache(fetchedIds)
        return new Set(fetchedIds)
    } catch (error) {
        logger.error('Error refreshing activity IDs:', error)
        throw new Error('Error refreshing activity IDs.')
    }
}
