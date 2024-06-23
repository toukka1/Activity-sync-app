import * as DocumentPicker from 'expo-document-picker'
import * as FileSystem from 'expo-file-system'
import * as SecureStore from 'expo-secure-store'
import { FileData } from '../types/fileTypes'
import convertOPHealthFileToGPX from '../utils/gpxUtils'
import { uploadToStrava } from './stravaService'

const logger = require('../utils/logger')

export default async function handleFileUpload() {
    try {
        const uri: string = await pickFile()
        const fileContent: string = await readFile(uri)
        const fileContentJson: FileData = JSON.parse(fileContent)
        const gpx: string = await convertOPHealthFileToGPX(fileContentJson)
        const gpxFileUri = await createAndWriteToFile(gpx)

        // Retrieve the access token from SecureStore
        const accessToken = await SecureStore.getItemAsync('strava_access_token')
        if (!accessToken) {
            throw new Error('Access token not found. Please log in to Strava.')
        }
        // Upload the GPX file to Strava
        await uploadToStrava(gpxFileUri, accessToken)
    } catch(error) {
        logger.error('An error occurred:', error)
    }
}

async function pickFile(): Promise<string> {
    const result = await DocumentPicker.getDocumentAsync({ type: 'text/plain' })

    if (result.canceled || !result.assets || !result.assets[0].uri) {
        throw new Error('File picking cancelled or failed')
    }

    return result.assets[0].uri
}

async function readFile(uri: string): Promise<string> {
    const fileContent: string = await FileSystem.readAsStringAsync(uri)
    if (!fileContent) {
        throw new Error('Failed to read the file')
    }
    return fileContent
}

async function createAndWriteToFile(content: string): Promise<string>{
    try {
        const uri: string = `${FileSystem.documentDirectory}gpxToUpload.gpx`
        await FileSystem.writeAsStringAsync(uri, content)
        logger.info('File written successfully!')
        return uri
    } catch (error) {
        throw new Error('Error writing file')
    }
}

export { handleFileUpload }
