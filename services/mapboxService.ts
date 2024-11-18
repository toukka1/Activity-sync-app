import axios from 'axios'

const logger = require('../utils/logger')
import config from '../utils/config'

const MAPBOX_BASE_URL = 'https://api.mapbox.com/directions/v5/mapbox'

export async function getDirections(startLon: number, startLat: number, endLon: number, endLat: number): Promise<number[][]> {
    try {
        const url = `${MAPBOX_BASE_URL}/walking/${startLon},${startLat};${endLon},${endLat}?geometries=geojson&access_token=${config.MAPBOX_ACCESS_TOKEN}`
        const response = await axios.get(url)

        if (response.data.code === 'Ok') {
            const coordinates = response.data.routes[0].geometry.coordinates

            return coordinates
        } else {
            throw new Error(`Mapbox API error: ${response.data.code}`)
        }
    } catch (error) {
        logger.error('Error fetching directions from Mapbox:', error)
        throw error
    }
}
