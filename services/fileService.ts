import * as FileSystem from 'expo-file-system'

import { FileData, ActivityData } from '../types/types'
import { parseOPHealthData } from '../utils/activityUtils'

import logger from '../utils/logger'


export async function pickDirectory(): Promise<string | null> {
    try {
        const permission = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync()
        if (permission.granted) {
            return permission.directoryUri
        }
        return null
    } catch (error) {
        throw new Error('Error picking directory.')
    }
}

export async function parseActivitiesFromDirectory(directoryUri: string): Promise<ActivityData[]> {
    const activities: ActivityData[] = []

    try {
        const files = await FileSystem.StorageAccessFramework.readDirectoryAsync(directoryUri)

        for (const file of files) {
            try {
                const fileContent = await readFileContent(file)
                const fileContentJson: FileData = JSON.parse(fileContent)
                let activityData: ActivityData = await parseOPHealthData(fileContentJson)
                const decodedUri = decodeURIComponent(file)
                const filename = decodedUri.split('/').pop()
                activityData.id = filename ?? ''
                activities.push(activityData)
            } catch (error) {
                logger.error('Failed to process file.')
            }
        }

        return activities
    } catch (error) {
        throw new Error('Error reading directory.')
    }
}

async function readFileContent(uri: string): Promise<string> {
    try {
        const fileContent = await FileSystem.readAsStringAsync(uri)
        if (!fileContent) {
            throw new Error('The selected file is empty or invalid.')
        }
        return fileContent
    } catch {
        throw new Error('Error reading file content.')
    }
}

export async function writeGpxFile(content: string): Promise<string> {
    try {
        const uri = `${FileSystem.documentDirectory}gpxToUpload.gpx`
        await FileSystem.writeAsStringAsync(uri, content)
        logger.info('File written successfully!')
        return uri
    } catch {
        throw new Error('Error writing file.')
    }
}
