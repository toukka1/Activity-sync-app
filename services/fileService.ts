import * as DocumentPicker from 'expo-document-picker'
import * as FileSystem from 'expo-file-system'
import { Alert } from 'react-native'

import { FileData } from '../types/types'
import convertOPHealthFileToGPX from '../utils/gpxUtils'

import logger from '../utils/logger'

export default async function pickAndConvertFileToGPX(): Promise<string> {
    try {
        const uri: string = await pickFile()
        const fileContent: string = await readFileContent(uri)
        const fileContentJson: FileData = JSON.parse(fileContent)
        const gpx: string = await convertOPHealthFileToGPX(fileContentJson)
        const gpxFileUri: string = await writeFile(gpx)

        return gpxFileUri
    } catch(error) {
        logger.error('An error occurred during file handling:', error)
        Alert.alert('Unexpected Error', 'An error occurred during file processing. Please check the file and try again.')
        return ''
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

async function writeFile(content: string): Promise<string> {
    try {
        const uri: string = `${FileSystem.documentDirectory}gpxToUpload.gpx`
        await FileSystem.writeAsStringAsync(uri, content)
        logger.info('File written successfully!')
        return uri
    } catch (error) {
        throw new Error('Error writing file')
    }
}
