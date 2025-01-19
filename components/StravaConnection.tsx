import React from 'react'
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native'

import colors from '../utils/colors'

export default function StravaConnection({
    isConnected,
    isLoading,
    onConnect,
    onDisconnect,
}: {
    isConnected: boolean
    isLoading: boolean
    onConnect: () => void
    onDisconnect: () => void
}) {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>
                {isConnected ? 'Connected to Strava' : 'Allow Strava access'}
            </Text>
            <TouchableOpacity
                style={
                    isLoading
                        ? styles.disabledButton
                        : isConnected
                            ? styles.disconnectButton
                            : styles.connectButton
                }
                onPress={isConnected ? onDisconnect : onConnect}
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
    )
}

const styles = StyleSheet.create({
    container: {
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
    connectButton: {
        backgroundColor: colors.success,
        width: 180,
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
        marginTop: 5,
    },
    disconnectButton: {
        backgroundColor: colors.error,
        width: 180,
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
        marginTop: 5,
    },
    disabledButton: {
        backgroundColor: colors.success,
        width: 180,
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
        marginTop: 5,
    },
})
