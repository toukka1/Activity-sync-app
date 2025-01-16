import React from 'react'
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Switch } from 'react-native'

import MapModal from './MapModal'
import ActivityList from '../components/ActivityList'
import { ActivityData, StravaAuthHook, HandleActivityUploadType } from '../types/types'
import { useHomeScreenState } from '../hooks/useHomeScreenState'
import { useDirectoryState } from '../hooks/useDirectoryState'
import { pickDirectory } from '../services/fileService'

import logger from '../utils/logger'

type HomeScreenProps = {
    activityService: HandleActivityUploadType
    authService: () => StravaAuthHook
}

export default function HomeScreen({ activityService, authService }: HomeScreenProps) {
    const {
        isModalVisible,
        setModalVisible,
        activityData,
        setActivityData,
        previewEnabled,
        togglePreview,
        closeModal,
    } = useHomeScreenState()
    const { isConnected, promptAsync, isLoading, disconnect } = authService()
    const { directoryUri, updateDirectoryUri } = useDirectoryState()

    async function handleFileUpload() {
        const { activityData } = await activityService(previewEnabled)

        if (previewEnabled) {
            setActivityData(activityData)
            setModalVisible(true)
        } else {
            logger.info('GPX file uploaded directly.')
        }
    }

    async function handlePickDirectory() {
        const uri = await pickDirectory()
        logger.info(uri)
        if (uri) updateDirectoryUri(uri)
    }

    async function handleUpdatedActivityUpload(updatedData: ActivityData) {
        await activityService(false, updatedData)
    }

    async function handleConnect() {
        await promptAsync()
    }

    return (
        <View style={styles.container}>
            <ActivityList directoryUri={directoryUri} />
            <View style={styles.row}>
                <Text>Enable Map Preview</Text>
                <Switch value={previewEnabled} onValueChange={togglePreview} />
            </View>
            <Text style={styles.text}>Choose an activity to upload</Text>

            <TouchableOpacity
                style={isConnected ? styles.browseButton : styles.opaqueBrowseButton}
                onPress={handlePickDirectory}
                disabled={!isConnected}
            >
                <Text style={styles.buttonText}>Browse</Text>
            </TouchableOpacity>

            {isConnected ? <Text style={styles.text}>Connected to Strava</Text> : null}

            <TouchableOpacity
                style={isLoading ? styles.disabledButton : (isConnected ? styles.disconnectButton : styles.connectButton)}
                onPress={isConnected ? disconnect : handleConnect}
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>
                        {isConnected ? 'Disconnect' : 'Connect to Strava'}
                    </Text>
                )}
            </TouchableOpacity>

            {activityData && (
                <MapModal
                    activityData={activityData}
                    isVisible={isModalVisible}
                    onConfirm={handleUpdatedActivityUpload}
                    onClose={closeModal}
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
    disabledButton: {
        backgroundColor: 'green',
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
        paddingHorizontal: 50,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
})
