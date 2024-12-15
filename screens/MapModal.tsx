import React, { useEffect, useState } from 'react'
import { View, Text, Button, Modal, TextInput, StyleSheet, TouchableOpacity } from 'react-native'
import MapView, { Polyline, PROVIDER_GOOGLE } from 'react-native-maps'

import { calculateTotalDistance, calculateBoundingBox, parseGPXFile } from '../utils/gpxUtils'
import { Waypoint } from '../types/types'

import logger from '../utils/logger'


interface MapModalProps {
    gpxFileUri: string | null
    isVisible: boolean
    onClose: () => void
    onConfirm: (activityName: string) => void
}


const MapModal: React.FC<MapModalProps> = ({ gpxFileUri, isVisible, onClose, onConfirm }) => {
    const [coordinates, setCoordinates] = useState<Waypoint[]>([])
    const [activityName, setActivityName] = useState<string>('Run')
    const [distance, setDistance] = useState<number>(0)
    const [avgHeartRate, setAvgHeartRate] = useState<number>(0)
    const [cadence, setCadence] = useState<number>(0)

    useEffect(() => {
        if (gpxFileUri) {
            loadGPXData()
        }
    }, [gpxFileUri])

    async function loadGPXData() {
        const waypoints = await parseGPXFile(gpxFileUri)

        const totalDistance = calculateTotalDistance(waypoints)
        const totalHeartRate = waypoints.reduce((sum, wp) => sum + (wp.heartRate || 0), 0)
        const totalCadence = waypoints.reduce((sum, wp) => sum + (wp.cadence || 0), 0)
        const nonZeroHeartRateWaypoints = waypoints.filter(wp => wp.heartRate > 0).length
        const nonZeroCadenceWaypoints = waypoints.filter(wp => wp.cadence > 0).length

        const avgHeartRate = nonZeroHeartRateWaypoints > 0 ? totalHeartRate / nonZeroHeartRateWaypoints : 0
        const avgCadence = nonZeroCadenceWaypoints > 0 ? totalCadence / nonZeroCadenceWaypoints : 0

        setCoordinates(waypoints)
        setDistance(totalDistance)
        setAvgHeartRate(avgHeartRate)
        setCadence(avgCadence * 2)
    }

    const handleConfirm = () => {
        onConfirm(activityName)
        onClose()
    }

    const validCoordinates = coordinates.filter(
        (point) => point.latitude !== 0 && point.longitude !== 0
    )

    const boundingBox = validCoordinates.length > 1 ? calculateBoundingBox(validCoordinates) : null

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
                    {validCoordinates.length > 0 && (
                        <MapView
                            provider={PROVIDER_GOOGLE}
                            style={styles.map}
                            initialRegion={{
                                latitude: boundingBox ? boundingBox.centerLatitude : validCoordinates[0].latitude,
                                longitude: boundingBox ? boundingBox.centerLongitude : validCoordinates[0].longitude,
                                latitudeDelta: boundingBox ? boundingBox.latitudeDelta : 0.01,
                                longitudeDelta: boundingBox ? boundingBox.longitudeDelta : 0.01,
                            }}
                        >
                            <Polyline coordinates={validCoordinates} strokeWidth={3} strokeColor="blue" />
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
        height: 200,
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
