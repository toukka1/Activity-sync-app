import { makeRedirectUri, useAuthRequest, AuthSessionResult } from 'expo-auth-session'
import * as SecureStore from 'expo-secure-store'
import axios from 'axios'
import { useEffect } from 'react'
import { Alert } from 'react-native'

const logger = require('../utils/logger')
import config from '../utils/config'

const discovery = {
    authorizationEndpoint: 'https://www.strava.com/oauth/mobile/authorize',
    tokenEndpoint: 'https://www.strava.com/oauth/token',
    revocationEndpoint: 'https://www.strava.com/oauth/deauthorize',
}

const redirectUri = __DEV__
    ? makeRedirectUri()
    : 'myapp://myapp.com'

export function useStravaAuthRequest() {
    const [request, response, promptAsync] = useAuthRequest(
        {
            clientId: config.STRAVA_CLIENT_ID,
            scopes: ['activity:write'],
            redirectUri: redirectUri,
        },
        discovery
    )

    // Handle response and token exchange
    useEffect(() => {
        if (response?.type === 'success') {
            const { code } = response.params

            // Exchange authorization code for access token
            axios.post('https://www.strava.com/oauth/token', {
                client_id: config.STRAVA_CLIENT_ID,
                client_secret: config.STRAVA_CLIENT_SECRET,
                code,
                grant_type: 'authorization_code',
            })
                .then(response => {
                    const accessToken = response.data.access_token
                    // Store the token for later use
                    SecureStore.setItemAsync('strava_access_token', accessToken)
                    Alert.alert('Authentication Success', 'You are successfully authenticated with Strava!')
                })
                .catch(error => {
                    logger.error('Error exchanging authorization code for token:', error)
                    Alert.alert('Authentication Error', 'Failed to authenticate with Strava. Please try again.')
                })
        }
    }, [response])

    return { request, response, promptAsync }
}
