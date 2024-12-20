import React, { useEffect, useState } from 'react'
import { View, Text, Button, Modal, TextInput, StyleSheet, TouchableOpacity } from 'react-native'
import MapView, { Polyline, Marker, PROVIDER_GOOGLE } from 'react-native-maps'

import { calculateTotalDistance, calculateBoundingBox, updateActivityWithNewStartPoint, convertActivityToGpx } from '../utils/activityUtils'
import { writeGpxFile } from '../services/fileService'
import { uploadToStrava } from '../services/stravaService'
import { Waypoint, ActivityData } from '../types/types'

import logger from '../utils/logger'


type MapModalProps = {
    activityData: ActivityData
    isVisible: boolean
    onClose: () => void
    onConfirm: () => void
}

const MapModal: React.FC<MapModalProps> = ({ activityData, isVisible, onClose, onConfirm }) => {
    const [waypoints, setWaypoints] = useState<Waypoint[]>([])
    const [activityName, setActivityName] = useState<string>('Run')
    const [distance, setDistance] = useState<number>(0)
    const [avgHeartRate, setAvgHeartRate] = useState<number>(0)
    const [cadence, setCadence] = useState<number>(0)
    const [startPoint, setStartPoint] = useState<{ latitude: number; longitude: number } | null>(null)
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
        if (activityData) {
            loadData()
        }
    }, [activityData])

    async function loadData() {
        const totalDistance = calculateTotalDistance(activityData.waypoints)

        setWaypoints(activityData.waypoints)
        setDistance(totalDistance)
        setAvgHeartRate(activityData.avgHeartRate)
        setCadence(activityData.avgFrequency)
        setStartPoint({
            latitude: activityData.waypoints[0].latitude,
            longitude: activityData.waypoints[0].longitude,
        })

        const boundingBox = calculateBoundingBox(activityData.waypoints)
        setRegion({
            latitude: boundingBox.centerLatitude,
            longitude: boundingBox.centerLongitude,
            latitudeDelta: boundingBox.latitudeDelta,
            longitudeDelta: boundingBox.longitudeDelta,
        })
    }

    async function handleConfirm() {
        logger.info(`Uploading ${activityName} to Strava`)

        activityData.waypoints = waypoints // Use the route confirmed by the user
        const gpxData: string = convertActivityToGpx(activityData)
        const gpxFileUri: string = await writeGpxFile(gpxData)

        uploadToStrava(gpxFileUri, activityName)
        onConfirm()
        onClose()
    }

    async function recalculateRoute(newStartPoint: { latitude: number; longitude: number }) {
        try {
            const updatedWaypoints = await updateActivityWithNewStartPoint(activityData, newStartPoint)
            const totalDistance = calculateTotalDistance(updatedWaypoints)

            setWaypoints(updatedWaypoints)
            setDistance(totalDistance)
            setStartPoint(newStartPoint)
        } catch (error) {
            logger.error('Failed to recalculate route:', error)
        }
    }

    return (
        <Modal
            visible={isVisible}
            transparent={true}
            animationType="slide"
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    {/* Editable Activity Name */}
                    <TextInput
                        style={styles.input}
                        value={activityName}
                        onChangeText={setActivityName}
                        placeholder="Activity Name"
                    />

                    {/* Map displaying the GPX route */}
                    {activityData && (
                        <MapView
                            provider={PROVIDER_GOOGLE}
                            style={styles.map}
                            region={region}
                            toolbarEnabled={false}
                        >
                            <Polyline coordinates={waypoints} strokeWidth={3} strokeColor="blue" />
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
                    )}

                    {/* Activity Details */}
                    <Text style={styles.infoText}>Distance: {(distance / 1000).toFixed(2)} km</Text>
                    <Text style={styles.infoText}>Avg Heart Rate: {avgHeartRate.toFixed(0)} bpm</Text>
                    <Text style={styles.infoText}>Cadence: {cadence.toFixed(0)} spm</Text>

                    

                    {/* Confirm and Cancel Buttons */}
                    <View style={styles.buttonRow}>
                        <Button title="Confirm Upload" onPress={handleConfirm} />
                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <Text style={styles.closeButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
    },
    modalContent: {
        width: '90%',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    map: {
        width: '100%',
        height: 300,
        marginBottom: 20,
    },
    infoText: {
        fontSize: 16,
        marginBottom: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        width: '100%',
        marginBottom: 20,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    closeButton: {
        padding: 10,
        marginLeft: 10,
    },
    closeButtonText: {
        color: 'red',
        fontWeight: 'bold',
    },
})

export default MapModal
