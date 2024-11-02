import * as DocumentPicker from 'expo-document-picker'
import * as FileSystem from 'expo-file-system'
import { FileData } from '../types/types'
import convertOPHealthFileToGPX from '../utils/gpxUtils'

const logger = require('../utils/logger')

export default async function handleFilePick(): Promise<string> {
    try {
        const uri: string = await pickFile()
        const fileContent: string = await readFile(uri)
        const fileContentJson: FileData = JSON.parse(fileContent)
        const gpx: string = await convertOPHealthFileToGPX(fileContentJson)
        const gpxFileUri: string = await createAndWriteToFile(gpx)

        return gpxFileUri
    } catch(error) {
        logger.error('An error occurred:', error)
        return ''
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

async function createAndWriteToFile(content: string): Promise<string> {
    try {
        const uri: string = `${FileSystem.documentDirectory}gpxToUpload.gpx`
        await FileSystem.writeAsStringAsync(uri, content)
        logger.info('File written successfully!')
        return uri
    } catch (error) {
        throw new Error('Error writing file')
    }
}

export { handleFilePick }
