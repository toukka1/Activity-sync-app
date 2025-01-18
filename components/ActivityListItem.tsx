import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { ActivityData, RootStackParamList } from '../types/types'

export default function ActivityListItem({ activityData }: { activityData: string }) {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()

    const data: ActivityData = JSON.parse(activityData)

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{'test'}</Text>
            <Text>Distance: {data.totalDistance} km</Text>
            <Text>Date: {data.startTime}</Text>
            <Text>{data.isSynced ? 'Synced' : 'Not synced'}</Text>
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('MapScreen', { activityData: activityData })}>
                <Text style={styles.buttonText} />
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    button: {
        backgroundColor: '#007AFF',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
    },
    buttonText: {
        fontSize: 18,
    }
})
