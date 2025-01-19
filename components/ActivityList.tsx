import React, { useEffect, useState, useImperativeHandle, forwardRef } from 'react'
import { Text, FlatList, StyleSheet, View, ActivityIndicator } from 'react-native'

import { parseActivitiesFromDirectory } from '../services/fileService'
import { refreshCachedActivityIds, getSyncedActivityIds, handleMultipleActivityUpload } from '../services/activityService'
import ActivityListItem from './ActivityListItem'
import { ActivityData } from '../types/types'
import colors from '../utils/colors'

import logger from '../utils/logger'

function ActivityList({ directoryUri }: { directoryUri: string | null }, ref: React.Ref<any>) {
    const [activities, setActivities] = useState<ActivityData[]>([])
    const [activityCount, setActivityCount] = useState<number>(0)
    const [syncedCount, setSyncedCount] = useState<number>(0)
    const [loading, setLoading] = useState<boolean>(true)

    async function loadActivities() {
        if (!directoryUri) return

        setLoading(true)
        try {
            const parsedActivities: ActivityData[] = await parseActivitiesFromDirectory(directoryUri)
            const syncedActivityIds: Set<string> = await getSyncedActivityIds()

            const updatedActivities = parsedActivities.map(activity => ({
                ...activity,
                isSynced: syncedActivityIds.has(activity.id),
            }))

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

    // Clear cache and reload activities
    async function refreshFull() {
        setLoading(true)
        try {
            await refreshCachedActivityIds()
            await loadActivities()
        } catch (error) {
            logger.error('Failed to refresh activities:', error)
        } finally {
            setLoading(false)
        }
    }

    // Only reload activities
    async function refresh() {
        setLoading(true)
        try {
            await loadActivities()
        } catch (error) {
            logger.error('Failed to refresh activities:', error)
        } finally {
            setLoading(false)
        }
    }

    // Expose the functions to the parent component
    useImperativeHandle(ref, () => ({
        refreshFull,
        refresh,
        syncActivities,
    }))

    useEffect(() => {
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
        height: '60%',
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
