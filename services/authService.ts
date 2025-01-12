import { makeRedirectUri, useAuthRequest } from 'expo-auth-session'
import * as SecureStore from 'expo-secure-store'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { Alert } from 'react-native'

import { StravaAuthHook } from '../types/types'

import logger from '../utils/logger'

const discovery = {
    authorizationEndpoint: 'https://www.strava.com/oauth/mobile/authorize',
    tokenEndpoint: 'https://activity-sync-app-backend.fly.dev',
    revocationEndpoint: 'https://www.strava.com/oauth/deauthorize',
}

// Dynamically generate the redirect URI based on the environment
const redirectUri = __DEV__
    ? makeRedirectUri()
    : 'myapp://myapp.com'

export async function storeTokens(data: any) {
    const { access_token, refresh_token, expires_at } = data
    await SecureStore.setItemAsync('strava_access_token', access_token)
    await SecureStore.setItemAsync('strava_refresh_token', refresh_token)
    await SecureStore.setItemAsync('strava_expires_at', expires_at.toString())
}

export async function refreshAccessToken() {
    try {
        const refreshToken = await SecureStore.getItemAsync('strava_refresh_token')
        if (!refreshToken) {
            throw new Error('No refresh token found')
        }

        const res = await axios.post(`${discovery.tokenEndpoint}/refresh-token`, {
            refresh_token: refreshToken,
        })

        await storeTokens(res.data)
        return res.data.access_token
    } catch (error) {
        logger.error('Error refreshing access token:', error)
        return null
    }
}

export async function getAccessToken() {
    const expiresAt = await SecureStore.getItemAsync('strava_expires_at')
    const currentTime = Math.floor(Date.now() / 1000)

    if (expiresAt && currentTime >= parseInt(expiresAt, 10)) {
        return await refreshAccessToken()
    }

    return await SecureStore.getItemAsync('strava_access_token')
}

export async function disconnectStrava() {
    try {
        const accessToken = await getAccessToken()
        if (accessToken) {
            await axios.post(discovery.revocationEndpoint, {}, {
                headers: { Authorization: `Bearer ${accessToken}` },
            })
        }
        await SecureStore.deleteItemAsync('strava_access_token')
        await SecureStore.deleteItemAsync('strava_refresh_token')
        await SecureStore.deleteItemAsync('strava_expires_at')
    } catch (error) {
        logger.error('Error disconnecting from Strava:', error)
    }
}

export function useStravaAuthRequest(): StravaAuthHook {
    const [isLoading, setIsLoading] = useState(false)
    const [isConnected, setIsConnected] = useState(false)
    const [request, response, promptAsync] = useAuthRequest(
        {
            clientId: process.env.EXPO_PUBLIC_STRAVA_CLIENT_ID || '',
            scopes: ['activity:write'],
            redirectUri,
        },
        discovery
    )

    // Check connection status on mount
    useEffect(() => {
        const checkConnection = async () => {
            const token = await SecureStore.getItemAsync('strava_access_token')
            setIsConnected(!!token)
        }
        checkConnection()
    }, [])

    // Handle response and exchange authorization code for tokens
    useEffect(() => {
        const exchangeToken = async () => {
            if (response?.type === 'success') {
                setIsLoading(true)
                const { code } = response.params

                try {
                    const res = await axios.post(`${discovery.tokenEndpoint}/exchange-token`, {
                        code,
                    })

                    storeTokens(res.data)
                    setIsConnected(true)
                } catch (error) {
                    logger.error('Error exchanging authorization code for token:', error)
                    Alert.alert('Authentication Error', 'Failed to authenticate with Strava. Please try again.')
                } finally {
                    setIsLoading(false)
                }
            }
        }

        exchangeToken()
    }, [response])

    // Disconnect from Strava
    const disconnect = async () => {
        try {
            const token = await SecureStore.getItemAsync('strava_access_token')
            if (token) {
                // Attempt to revoke the token via Strava API
                await axios.post(discovery.revocationEndpoint, {}, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                logger.info('Successfully revoked Strava token.')
            }
        } catch (error) {
            logger.error('Error disconnecting from Strava:', error)

            // Inform the user about the revocation failure
            Alert.alert(
                'Disconnection Warning',
                'Failed to notify Strava about disconnection. Local data will still be cleared.'
            )
        }

        // Clear local tokens regardless of revocation success
        try {
            await SecureStore.deleteItemAsync('strava_access_token')
            await SecureStore.deleteItemAsync('strava_refresh_token')
            await SecureStore.deleteItemAsync('strava_expires_at')

            setIsConnected(false)
            Alert.alert('Disconnected', 'You have been successfully disconnected from Strava.')
        } catch (error) {
            logger.error('Error clearing local tokens:', error)
            Alert.alert(
                'Error',
                'Failed to clear local Strava data. Please try again or restart the app.'
            )
        }
    }

    return { request, promptAsync, isConnected, isLoading, disconnect }
}
