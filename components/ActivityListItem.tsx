import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { ActivityData, RootStackParamList } from '../types/types'
import formatter from '../utils/formatter'
import colors from '../utils/colors'

export default function ActivityListItem({ activityData }: { activityData: string }) {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()

    const data: ActivityData = JSON.parse(activityData)

    function onView() {
        navigation.navigate('MapScreen', { activityData: activityData })
    }

    return (
        <View style={styles.container}>
            <View style={styles.statusContainer}>
                {data.isSynced ? (
                    <>
                        <Ionicons name='checkmark-circle' size={16} color={colors.success}/>
                        <Text style={styles.syncedText}>Synced</Text>
                    </>
                ) : (
                    <>
                        <Ionicons name='alert-circle' size={16} color={colors.disabledGray}/>
                        <Text style={styles.unsyncedText}>Not Synced</Text>
                    </>
                )}
            </View>

            <View style={styles.distanceDateContainer}>
                <Text style={styles.distance}>{formatter.distance(data.totalDistance)}</Text>
                <Text style={styles.date}>{formatter.date(data.startTime)}</Text>
            </View>

            {/* View/Edit Button */}
            <TouchableOpacity onPress={onView} disabled={data.isSynced}>
                <Text style={data.isSynced ? styles.editButtonDisabled : styles.editButton}>View/Edit</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 13,
        paddingHorizontal: 15,
        borderBottomWidth: 0.5,
        borderBottomColor: colors.border,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        maxWidth: 85,
        justifyContent: 'space-between',
        flex: 0.4,
    },
    syncedText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.success,
    },
    unsyncedText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.disabledGray,
    },
    distanceDateContainer: {
        flex: 0.5,
        alignItems: 'flex-start',
    },
    distance: {
        fontSize: 16,
        fontWeight: 'bold',
        flex: 0.6,
        textAlign: 'center',
    },
    date: {
        fontSize: 14,
        flex: 1,
        color: colors.textColor,
        textAlign: 'center',
    },
    editButton: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.primary,
    },
    editButtonDisabled: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.disabledGray,
    },
})
