import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import MapView, { Polyline, Marker, PROVIDER_GOOGLE } from 'react-native-maps'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'

import { calculateTotalDistance, calculateBoundingBox, updateActivityWithNewStartPoint } from '../utils/activityUtils'
import { Waypoint, ActivityData, RootStackParamList } from '../types/types'
import formatter from '../utils/formatter'

import logger from '../utils/logger'


type Props = NativeStackScreenProps<RootStackParamList, 'MapScreen'>

export default function MapScreen({ route, navigation }: Props) {
    const [activityData, setActivityData] = useState<ActivityData | null>(null)
    const [waypoints, setWaypoints] = useState<Waypoint[]>([])
    const [distance, setDistance] = useState<number>(0)
    const [startPoint, setStartPoint] = useState<{ latitude: number; longitude: number } | null>(null)
    const [resetStartPointActive, setResetStartPointActive] = useState<boolean>(false)
    const [region, setRegion] = useState<{
        latitude: number
        longitude: number
        latitudeDelta: number
        longitudeDelta: number
    }>({
        latitude: 0,
        longitude: 0,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
    })

    useEffect(() => {
        if (route.params.activityData) {
            loadData()
        }
    }, [route.params.activityData])

    async function loadData() {
        const data: ActivityData = JSON.parse(route.params.activityData)
        if (!data) return

        setActivityData(data)

        const totalDistance = calculateTotalDistance(data.waypoints)

        setWaypoints(data.waypoints)
        setDistance(totalDistance)
        setStartPoint(data.startPoint)

        const boundingBox = calculateBoundingBox(data.waypoints)
        setRegion({
            latitude: boundingBox.centerLatitude,
            longitude: boundingBox.centerLongitude,
            latitudeDelta: boundingBox.latitudeDelta,
            longitudeDelta: boundingBox.longitudeDelta,
        })
    }

    async function resetStartingPoint() {
        if (!activityData) return

        const totalDistance = calculateTotalDistance(activityData.waypoints)

        setWaypoints(activityData.waypoints)
        setDistance(totalDistance)
        setStartPoint(activityData.startPoint)
        setResetStartPointActive(false)
    }

    async function recalculateRoute(newStartPoint: { latitude: number; longitude: number }) {
        try {
            const updatedWaypoints = await updateActivityWithNewStartPoint(activityData, newStartPoint)
            const totalDistance = calculateTotalDistance(updatedWaypoints)

            setWaypoints(updatedWaypoints)
            setDistance(totalDistance)
            setStartPoint(newStartPoint)
            setResetStartPointActive(true)
        } catch (error) {
            logger.error('Failed to recalculate route:', error)
        }
    }

    return (
        <View style={styles.container}>
            {/* Map displaying the GPX route */}
            <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                region={region}
                toolbarEnabled={false}
            >
                <Polyline coordinates={waypoints} strokeWidth={4} strokeColor="blue" />
                {startPoint && (
                    <Marker
                        draggable
                        coordinate={startPoint}
                        onDragEnd={(e) =>
                            recalculateRoute(e.nativeEvent.coordinate)
                        }
                        pinColor="red"
                    />
                )}
            </MapView>

            {/* Modal with activity details */}
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <View style={styles.modalGrid}>
                        <View style={styles.gridItem}>
                            <Text style={styles.gridHeader}>Distance</Text>
                            <Text style={styles.gridValue}>{(distance / 1000).toFixed(2)} km</Text>
                        </View>
                        <View style={styles.gridItem}>
                            <Text style={styles.gridHeader}>Heart Rate</Text>
                            <Text style={styles.gridValue}>{activityData?.avgHeartRate.toFixed(0)} bpm</Text>
                        </View>
                        <View style={styles.gridItem}>
                            <Text style={styles.gridHeader}>Cadence</Text>
                            <Text style={styles.gridValue}>{activityData?.avgFrequency.toFixed(0)} spm</Text>
                        </View>
                        <View style={styles.gridItem}>
                            <Text style={styles.gridHeader}>Date</Text>
                            <Text style={styles.gridValue}>{formatter.formatDate(activityData?.startTime)}</Text>
                        </View>
                        <View style={styles.gridItem}>
                            <Text style={styles.gridHeader}>Duration</Text>
                            <Text style={styles.gridValue}>{formatter.formatDuration(activityData?.totalTime)}</Text>
                        </View>
                        <View style={styles.gridItem}>
                            <Text style={styles.gridHeader}>Pace</Text>
                            <Text style={styles.gridValue}>{formatter.formatPace(activityData?.avgSpeed)}</Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={resetStartPointActive ? styles.resetButton : styles.disabledButton}
                        onPress={resetStartingPoint}
                        disabled={!resetStartPointActive}
                    >
                        <Text style={styles.buttonText}>Reset starting point</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderRadius: 10,
        alignItems: 'center',
    },
    modalContainer: {
        position: 'absolute',
        bottom: 15,
        width: '90%',
        height: '34%',
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        borderRadius: 20,
        elevation: 95,
    },
    modalContent: {
        flex: 1,
        padding: 20,
        alignItems: 'center',
    },
    modalGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    gridItem: {
        width: '48%',
        marginBottom: 15,
        alignItems: 'center',
    },
    gridHeader: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#555',
        marginBottom: 5,
    },
    gridValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    map: {
        width: '100%',
        height: '100%',
    },
    infoText: {
        fontSize: 16,
        marginBottom: 10,
    },
    resetButton: {
        backgroundColor: '#007AFF',
        padding: 7,
        borderRadius: 5,
        alignItems: 'center',
        width: '90%',
    },
    disabledButton: {
        backgroundColor: 'lightgrey',
        padding: 7,
        borderRadius: 5,
        alignItems: 'center',
        width: '90%',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
})
