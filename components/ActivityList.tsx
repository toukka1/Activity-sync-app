import React, { useEffect, useState } from 'react'
import { Text, FlatList, StyleSheet, View } from 'react-native'

import { parseActivitiesFromDirectory } from '../services/fileService'
import ActivityListItem from './ActivityListItem'
import { ActivityData } from '../types/types'

export default function ActivityList({ directoryUri }: { directoryUri: string | null }) {
    const [activities, setActivities] = useState<ActivityData[]>([])

    useEffect(() => {
        const loadActivities = async () => {
            if (directoryUri) {
                const parsedActivities = await parseActivitiesFromDirectory(directoryUri)
                setActivities(parsedActivities)
            }
        }
        loadActivities()
    }, [directoryUri])

    if (!directoryUri) {
        return (
            <View style={styles.container}>
                <Text style={styles.text}>Please select a directory to view activities.</Text>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={activities}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => <ActivityListItem activityData={JSON.stringify(item)} />}
                contentContainerStyle={styles.listContent}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        height: '75%',
        width: '100%',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    listContent: {
        padding: 8,
    },
    text: {
        color: '#808080',
        fontSize: 15,
        fontWeight: 'bold',
        paddingVertical: 10,
        textAlign: 'center',
    },
})
