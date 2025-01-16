import React, { useEffect, useState } from 'react'
import { Text, FlatList, StyleSheet } from 'react-native'
import { parseActivitiesFromDirectory } from '../services/fileService'
import { ActivityData } from '../types/types'

import logger from '../utils/logger'

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
        return <Text style={styles.text}>Please select a directory to view activities.</Text>
    }

    return (
        <FlatList
            data={activities}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => <Text style={styles.text}>{item.startTime}</Text>}
        />
    )
}

const styles = StyleSheet.create({
    itemContainer: {
        padding: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    text: {
        color: '#808080',
        fontSize: 15,
        fontWeight: 'bold',
    },
})
