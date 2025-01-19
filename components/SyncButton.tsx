import React from 'react'
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

import colors from '../utils/colors'

export function SyncButton({ onPress, isDisabled }: { onPress: () => void; isDisabled: boolean }) {
    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={onPress} disabled={isDisabled}>
                <Ionicons
                    name="sync-circle"
                    size={60}
                    color={isDisabled ? colors.disabledGray : colors.primary}
                />
            </TouchableOpacity>
            <Text style={styles.text}>Sync All</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        alignItems: 'center',
        bottom: 130,
    },
    text: {
        color: colors.textColor,
        fontSize: 15,
        fontWeight: 'bold',
    },
})

