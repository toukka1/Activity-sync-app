import React, { useEffect, useState, useImperativeHandle, forwardRef } from 'react'
import { Text, FlatList, StyleSheet, View, ActivityIndicator } from 'react-native'

import { parseActivitiesFromDirectory } from '../services/fileService'
import { getSyncedActivityIds, handleMultipleActivityUpload } from '../services/activityService'
import ActivityListItem from './ActivityListItem'
import { ActivityData } from '../types/types'
import colors from '../utils/colors'

import logger from '../utils/logger'


type ActivityListProps = {
    directoryUri: string | null
}

function ActivityList(props: ActivityListProps, ref: React.Ref<any>) {
    const { directoryUri } = props

    const [activities, setActivities] = useState<ActivityData[]>([])
    const [activityCount, setActivityCount] = useState<number>(0)
    const [syncedCount, setSyncedCount] = useState<number>(0)
    const [loading, setLoading] = useState<boolean>(true)

    useImperativeHandle(ref, () => ({
        refresh: loadActivities,
        syncActivities,
    }))

    useEffect(() => {
        loadActivities()
    }, [directoryUri])

    async function loadActivities() {
        if (!directoryUri) {
            resetActivities()
            return
        }

        setLoading(true)
        try {
            const updatedActivities = await fetchActivities(directoryUri)
            setActivities(updatedActivities)
            setActivityCount(updatedActivities.length)
            setSyncedCount(updatedActivities.filter(activity => activity.isSynced).length)
        } catch (error) {
            logger.error('Failed to load activities:', error)
        } finally {
            setLoading(false)
        }
    }

    async function syncActivities() {
        setLoading(true)
        try {
            await handleMultipleActivityUpload(activities)
            await loadActivities()
        } catch (error) {
            logger.error('Failed to sync activities:', error)
        } finally {
            setLoading(false)
        }
    }

    function resetActivities() {
        setActivities([])
        setActivityCount(0)
        setSyncedCount(0)
    }

    async function fetchActivities(uri: string): Promise<ActivityData[]> {
        const parsedActivities = await parseActivitiesFromDirectory(uri)
        const syncedActivityIds = await getSyncedActivityIds()

        return parsedActivities.map(activity => ({
            ...activity,
            isSynced: syncedActivityIds.has(activity.id),
        }))
    }

    if (!directoryUri) {
        return (
            <View style={styles.container}>
                <Text style={styles.text}>Please select a directory to view activities.</Text>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <Text style={styles.text}>
                Activities: {syncedCount} / {activityCount} synced
            </Text>
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size='large' color={colors.primary} />
                    <Text>Loading activities...</Text>
                </View>
            ) : (
                <FlatList
                    data={activities}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => <ActivityListItem activityData={JSON.stringify(item)} />}
                    contentContainerStyle={styles.listContent}
                />
            )}
        </View>
    )
}

export default forwardRef(ActivityList)

const styles = StyleSheet.create({
    container: {
        height: '70%',
        width: '100%',
        borderWidth: 1,
        borderColor: colors.border,
    },
    listContent: {
        padding: 8,
    },
    text: {
        color: colors.textColor,
        fontSize: 15,
        fontWeight: 'bold',
        paddingVertical: 10,
        textAlign: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
})
