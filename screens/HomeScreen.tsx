import React, { useState } from 'react'
import { StyleSheet, Text, View, TouchableOpacity, Switch } from 'react-native'

import { handleActivityUpload } from '../services/activityService'
import { useStravaAuthRequest } from '../services/authService'
import MapModal from './MapModal'
import { ActivityData } from '../types/types'

import logger from '../utils/logger'

export default function Home() {
    const { isConnected, promptAsync, isLoading, disconnect } = useStravaAuthRequest()
    const [isModalVisible, setModalVisible] = useState(false)
    const [activityData, setActivityData] = useState<ActivityData | null>(null)
    const [previewEnabled, setPreviewEnabled] = useState(true)

    function handleTogglePreview() {
        setPreviewEnabled((prev) => !prev)
    }

    async function handleFileUpload() {
        const { activityData } = await handleActivityUpload(previewEnabled)

        if (previewEnabled) {
            setActivityData(activityData)
            setModalVisible(true)
        } else {
            logger.info('GPX file uploaded directly.')
        }
    }

    async function handleUpdatedActivityUpload(updatedData: ActivityData) {
        await handleActivityUpload(false, updatedData)
    }

    function handleCloseModal() {
        setModalVisible(false)
        setActivityData(null)
    }

    async function handleConnect() {
        await promptAsync()
    }

    return (
        <View style={styles.container}>
            <View style={styles.row}>
                <Text>Enable Map Preview</Text>
                <Switch value={previewEnabled} onValueChange={handleTogglePreview} />
            </View>
            <Text style={styles.text}>Choose an activity to upload</Text>

            <TouchableOpacity
                style={isConnected ? styles.browseButton : styles.opaqueBrowseButton}
                onPress={handleFileUpload}
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

            {activityData && (
                <MapModal
                    activityData={activityData}
                    isVisible={isModalVisible}
                    onConfirm={handleUpdatedActivityUpload}
                    onClose={handleCloseModal}
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
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
})
