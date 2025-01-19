import React, { useRef, useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'

import ActivityList from '../components/ActivityList'
import DirectorySelection from '../components/DirectorySelection'
import StravaConnection from '../components/StravaConnection'
import { SyncButton } from '../components/SyncButton'
import { useDirectoryState } from '../hooks/useDirectoryState'
import { useStravaAuthRequest } from '../services/authService'
import { pickDirectory } from '../services/fileService'
import { RootStackParamList } from '../types/types'
import colors from '../utils/colors'

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

    function handlePickDirectory() {
        pickDirectory().then(uri => {
            if (uri) updateDirectoryUri(uri)
        })
    }

    function handleResetDirectory() {
        updateDirectoryUri(null)
    }

    function handleConnect() {
        promptAsync()
    }

    function handleSyncActivities() {
        if (activityListRef.current) {
            activityListRef.current.syncActivities()
        }
    }

    return (
        <View style={styles.container}>
            <ActivityList directoryUri={directoryUri} ref={activityListRef} />

            <SyncButton
                onPress={handleSyncActivities}
                isDisabled={!directoryUri || !isConnected}
            />

            <DirectorySelection
                directoryUri={directoryUri}
                onPick={handlePickDirectory}
                onReset={handleResetDirectory}
            />

            <StravaConnection
                isConnected={isConnected}
                isLoading={isLoading}
                onConnect={handleConnect}
                onDisconnect={disconnect}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        alignItems: 'center',
    },
    text: {
        color: colors.textColor,
        fontSize: 15,
        fontWeight: 'bold',
    },
})

