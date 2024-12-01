import React, { useState } from 'react'
import { StyleSheet, Text, View, Button } from 'react-native'
import handleFilePick from '../services/fileService'
import { useStravaAuthRequest } from '../services/authService'
import { uploadToStrava } from '../services/stravaService'
import MapModal from './MapModal'

import logger from '../utils/logger'

export default function Home() {
    const { request, promptAsync } = useStravaAuthRequest()
    const [isModalVisible, setModalVisible] = useState(false)
    const [gpxFileUri, setGpxFileUri] = useState('')

    async function handleFileSelect() {
        try {

            const fileUri = await handleFilePick()

            if (fileUri) {
                setGpxFileUri(fileUri)
                setModalVisible(true)
            }
        } catch (error) {
            logger.error('Error selecting file:', error)
        }
    }

    function handleConfirmUpload(activityName: string) {
        logger.info(`Uploading ${activityName} to Strava`)
        uploadToStrava(gpxFileUri, activityName)
        setModalVisible(false)
    }

    function handleCloseModal() {
        setModalVisible(false)
        setGpxFileUri('')
    }

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Choose activities to upload</Text>

            <Button title="Browse" onPress={handleFileSelect} />

            <Button
                disabled={!request}
                title="Login"
                onPress={() => {
                    promptAsync()
                }}
            />
            {gpxFileUri && (
                <MapModal
                    isVisible={isModalVisible}
                    onClose={handleCloseModal}
                    gpxFileUri={gpxFileUri}
                    onConfirm={handleConfirmUpload}
                />
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        color: '#808080',
        fontSize: 15,
        fontWeight: 'bold',
    },
})
