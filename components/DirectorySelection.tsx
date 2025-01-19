import React from 'react'
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'

import colors from '../utils/colors'

export default function DirectorySelection({
    directoryUri,
    onPick,
    onReset,
}: {
    directoryUri: string | null
    onPick: () => void
    onReset: () => void
}) {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>
                {directoryUri ? 'Directory chosen' : 'Select directory'}
            </Text>
            <TouchableOpacity
                style={styles.button}
                onPress={directoryUri ? onReset : onPick}
            >
                <Text style={styles.buttonText}>
                    {directoryUri ? 'Reset' : 'Browse'}
                </Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        alignItems: 'center',
        bottom: 16,
        left: 16,
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
    button: {
        backgroundColor: colors.primary,
        width: 180,
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
        marginTop: 5,
    },
})
