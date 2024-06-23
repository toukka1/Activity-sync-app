const MAPBOX_ACCESS_TOKEN: string = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || ''
const STRAVA_CLIENT_ID: string = process.env.EXPO_PUBLIC_STRAVA_CLIENT_ID || ''
const STRAVA_CLIENT_SECRET: string = process.env.EXPO_PUBLIC_STRAVA_CLIENT_SECRET || ''

if (!MAPBOX_ACCESS_TOKEN || !STRAVA_CLIENT_ID || !STRAVA_CLIENT_SECRET) {
  throw new Error('Missing required environment variables')
}

module.exports = {
  MAPBOX_ACCESS_TOKEN,
  STRAVA_CLIENT_ID,
  STRAVA_CLIENT_SECRET
}
