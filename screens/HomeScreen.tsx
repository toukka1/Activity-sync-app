import React, { useRef, useEffect } from 'react'
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'

import ActivityList from '../components/ActivityList'
import { useDirectoryState } from '../hooks/useDirectoryState'
import { useStravaAuthRequest } from '../services/authService'
import { pickDirectory } from '../services/fileService'
import { RootStackParamList } from '../types/types'
import colors from '../utils/colors'

import logger from '../utils/logger'

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>

export default function HomeScreen({ route, navigation }: Props) {
    const { isConnected, promptAsync, isLoading, disconnect } = useStravaAuthRequest()
    const { directoryUri, updateDirectoryUri } = useDirectoryState()
    const activityListRef = useRef<any>()

    useEffect(() => {
        if (route.params?.refresh && activityListRef.current) {
            activityListRef.current.refresh()
            navigation.setParams({ refresh: false })
        }
    }, [route.params?.refresh, navigation])

    async function handlePickDirectory() {
        const uri = await pickDirectory()
        if (uri) updateDirectoryUri(uri)
    }

    async function handleResetDirectory() {
        updateDirectoryUri(null)
    }

    async function handleConnect() {
        await promptAsync()
    }

    async function handleSyncActivities() {
        if (activityListRef.current) {
            activityListRef.current.syncActivities()
        }
    }

    return (
        <View style={styles.container}>
            {/* Activity List */}
            <View style={styles.listContainer}>
                <ActivityList directoryUri={directoryUri} ref={activityListRef} />
            </View>

            {/* Sync button */}
            <View style={styles.topCenter}>
                <TouchableOpacity onPress={handleSyncActivities} disabled={directoryUri === null || !isConnected}>
                    <Ionicons name="sync-circle" size={60} color={directoryUri === null || !isConnected ? colors.disabledGray : colors.primary} />
                </TouchableOpacity>
                <Text style={styles.text}>Sync All</Text>
            </View>

            {/* Browse Directory */}
            <View style={styles.bottomLeft}>
                {!directoryUri ? (
                    <>
                        <Text style={styles.text}>Select directory</Text>
                        <TouchableOpacity
                            style={styles.browseButton}
                            onPress={handlePickDirectory}
                        >
                            <Text style={styles.buttonText}>Browse</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        <Text style={styles.text}>Directory chosen</Text>
                        <TouchableOpacity
                            style={styles.browseButton}
                            onPress={handleResetDirectory}
                        >
                            <Text style={styles.buttonText}>Reset</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>

            {/* Strava Connection */}
            <View style={styles.bottomRight}>
                <Text style={styles.text}>
                    {isConnected ? 'Connected to Strava' : 'Allow Strava access'}
                </Text>
                <TouchableOpacity
                    style={isLoading ? styles.disabledButton : (isConnected ? styles.disconnectButton : styles.connectButton)}
                    onPress={isConnected ? disconnect : handleConnect}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color={colors.background} size={25} />
                    ) : (
                        <Text style={styles.buttonText}>
                            {isConnected ? 'Disconnect' : 'Connect'}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    listContainer: {
        flex: 1,
        width: '100%',
        position: 'absolute',
        top: 0,
        bottom: 0,
    },
    topCenter: {
        position: 'absolute',
        alignItems: 'center',
        bottom: 130,
    },
    bottomLeft: {
        position: 'absolute',
        alignItems: 'center',
        bottom: 16,
        left: 16,
    },
    bottomRight: {
        position: 'absolute',
        alignItems: 'center',
        bottom: 16,
        right: 16,
    },
    text: {
        color: colors.textColor,
        fontSize: 15,
        fontWeight: 'bold',
    },
    buttonText: {
        color: colors.background,
        alignSelf: 'center',
        fontSize: 16,
        fontWeight: 'bold',
    },
    browseButton: {
        backgroundColor: colors.primary,
        width: 180,
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
        marginTop: 5,
    },
    connectButton: {
        backgroundColor:colors.success,
        width: 180,
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
        marginTop: 5,
    },
    disconnectButton: {
        backgroundColor:colors.error,
        width: 180,
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
        marginTop: 5,
    },
    disabledButton: {
        backgroundColor:colors.success,
        width: 180,
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
        marginTop: 5,
    },
    refreshContainer: {
        alignItems: 'center',
    },
})
