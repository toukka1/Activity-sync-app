import React, { useEffect, useState, useImperativeHandle, forwardRef } from 'react'
import { Text, FlatList, StyleSheet, View, ActivityIndicator } from 'react-native'

import { parseActivitiesFromDirectory } from '../services/fileService'
import { refreshCachedActivityIds, getSyncedActivityIds } from '../services/activityService'
import ActivityListItem from './ActivityListItem'
import { ActivityData } from '../types/types'

import logger from '../utils/logger'

const ActivityList = forwardRef(({ directoryUri }: { directoryUri: string | null }, ref) => {
    const [activities, setActivities] = useState<ActivityData[]>([])
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
        } catch (error) {
            logger.error('Failed to load activities:', error)
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

    // Only reload load activities
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

    // Expose the refresh functions to the parent component
    useImperativeHandle(ref, () => ({
        refreshFull,
        refresh
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
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
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
})

export default ActivityList

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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
})
