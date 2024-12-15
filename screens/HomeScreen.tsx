import React, { useState } from 'react'
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'

import handleFilePick from '../services/fileService'
import { useStravaAuthRequest } from '../services/authService'
import { uploadToStrava } from '../services/stravaService'
import MapModal from './MapModal'

import logger from '../utils/logger'

export default function Home() {
    const { isConnected, promptAsync, isLoading, disconnect } = useStravaAuthRequest()
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

    async function handleConnect() {
        await promptAsync()
    }

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Choose activities to upload</Text>

            <TouchableOpacity
                style={isConnected ? styles.browseButton : styles.opaqueBrowseButton}
                onPress={handleFileSelect}
                disabled={!isConnected}
            >
                <Text style={styles.buttonText}>Browse</Text>
            </TouchableOpacity>

            {isConnected ? <Text style={styles.text}>Connected to Strava</Text> : null}

            <TouchableOpacity
                style={isConnected ? styles.disconnectButton : styles.connectButton}
                onPress={isLoading ? () => {} : (isConnected ? disconnect : handleConnect)}
            >
                <Text style={styles.buttonText}>
                    {isConnected ? 'Disconnect' : 'Connect to Strava'}
                </Text>
            </TouchableOpacity>

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
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    browseButton: {
        backgroundColor: '#007AFF',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
    },
    opaqueBrowseButton: {
        backgroundColor: '#007AFF',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
        opacity: 0.3,
    },
    connectButton: {
        backgroundColor: 'green',
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
    },
    disconnectButton: {
        backgroundColor: 'red',
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
    },
})
