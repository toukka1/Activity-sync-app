import * as DocumentPicker from 'expo-document-picker'
import * as FileSystem from 'expo-file-system'
import { Alert } from 'react-native'

import { FileData, ActivityData } from '../types/types'
import parseOPHealthFile from '../utils/activityUtils'

import logger from '../utils/logger'

export async function pickAndParseFile(): Promise<ActivityData | null> {
    try {
        const uri = await pickFile()
        const fileContent = await readFileContent(uri)
        const fileContentJson: FileData = JSON.parse(fileContent)
        const activityData: ActivityData = await parseOPHealthFile(fileContentJson)

        return activityData
    } catch (error: any) {
        logger.error('An error occurred during file handling:', error)

        if (error.message.includes('file selected')) {
            Alert.alert('File Error', error.message)
        } else if (error.message.includes('file is empty') || error.message.includes('reading file')) {
            Alert.alert('Read Error', error.message)
        } else if (error instanceof SyntaxError) {
            Alert.alert('Parse Error', 'The file content is not valid JSON.')
        } else {
            Alert.alert('Unexpected Error', 'Something went wrong. Please try again.')
        }

        return null
    }
}

async function pickFile(): Promise<string> {
    const result = await DocumentPicker.getDocumentAsync({ type: 'text/plain' })

    if (result.canceled || !result.assets || !result.assets[0].uri) {
        throw new Error('No file selected or picking was cancelled.')
    }

    return result.assets[0].uri
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
