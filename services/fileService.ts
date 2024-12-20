import * as DocumentPicker from 'expo-document-picker'
import * as FileSystem from 'expo-file-system'
import { Alert } from 'react-native'

import { FileData, ActivityData } from '../types/types'
import parseOPHealthFile from '../utils/activityUtils'

import logger from '../utils/logger'

export default async function pickAndParseFile(): Promise<ActivityData | null> {
    try {
        const uri: string = await pickFile()
        const fileContent: string = await readFileContent(uri)
        const fileContentJson: FileData = JSON.parse(fileContent)
        const activityData: ActivityData = await parseOPHealthFile(fileContentJson)

        return activityData
    } catch(error) {
        logger.error('An error occurred during file handling:', error)
        Alert.alert('Unexpected Error', 'An error occurred during file processing. Please check the file and try again.')
        return null
    }
}

async function pickFile(): Promise<string> {
    const result = await DocumentPicker.getDocumentAsync({ type: 'text/plain' })

    if (result.canceled || !result.assets || !result.assets[0].uri) {
        Alert.alert('File Selection Error', 'No file was selected. Please try again.')
        throw new Error('No file selected or picking was cancelled.')
    }

    return result.assets[0].uri
}

async function readFileContent(uri: string): Promise<string> {
    const fileContent: string = await FileSystem.readAsStringAsync(uri)
    if (!fileContent) {
        Alert.alert('File Error', 'The selected file is empty or invalid.')
        throw new Error('Failed to read the file')
    }
    return fileContent
}

export async function writeGpxFile(content: string): Promise<string> {
    try {
        const uri: string = `${FileSystem.documentDirectory}gpxToUpload.gpx`
        await FileSystem.writeAsStringAsync(uri, content)
        logger.info('File written successfully!')
        return uri
    } catch (error) {
        throw new Error('Error writing file')
    }
}
