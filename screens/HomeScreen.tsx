import React, { useRef, useEffect } from 'react'
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'

import ActivityList from '../components/ActivityList'
import { useDirectoryState } from '../hooks/useDirectoryState'
import { useStravaAuthRequest } from '../services/authService'
import { pickDirectory } from '../services/fileService'
import { RootStackParamList } from '../types/types'

import logger from '../utils/logger'

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>

export default function HomeScreen({ route, navigation }: Props) {
    const { isConnected, promptAsync, isLoading, disconnect } = useStravaAuthRequest()
    const { directoryUri, updateDirectoryUri } = useDirectoryState()
    const activityListRef = useRef<any>()

    useEffect(() => {
        if (route.params?.refresh && activityListRef.current) {
            activityListRef.current.refresh()
            // Optionally clear the refresh flag to prevent repeated calls
            navigation.setParams({ refresh: false })
        }
    }, [route.params?.refresh, navigation])

    async function handlePickDirectory() {
        const uri = await pickDirectory()
        if (uri) updateDirectoryUri(uri)
    }

    async function handleResetUri() {
        updateDirectoryUri(null)
    }

    async function handleConnect() {
        await promptAsync()
    }

    async function handleRefreshFull() {
        if (activityListRef.current) {
            activityListRef.current.refreshFull()
        }
    }

    return (
        <View style={styles.container}>
            <ActivityList directoryUri={directoryUri} ref={activityListRef} />
            <TouchableOpacity
                style={styles.browseButton}
                onPress={handleResetUri}
            >
                <Text style={styles.buttonText}>reset</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleRefreshFull}>
                <Ionicons name='refresh-circle' size={40} color='#007AFF' />
            </TouchableOpacity>
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
