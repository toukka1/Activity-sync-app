import { StyleSheet, View, StatusBar, Button, Alert } from 'react-native'
import HomeScreen from './screens/HomeScreen'
import Banner from './components/Banner'
const logger = require('./utils/logger')
import React, { useEffect, useState } from 'react'
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'


const discovery = {
  authorizationEndpoint: 'https://www.strava.com/oauth/mobile/authorize',
  tokenEndpoint: 'https://www.strava.com/oauth/token',
  revocationEndpoint: 'https://www.strava.com/oauth/deauthorize',
}

export default function App() {

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: 'CLIENT_ID',
      scopes: ['activity:read_all'],
      redirectUri: makeRedirectUri({
        native: 'myapp://myapp.com',
      }),
    },
    discovery
  )

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { code } = response.params
    }
  }, [response])

  console.log(response)

  logger.info('moi')
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#007AFF" barStyle="light-content"/>
      {/* <Banner /> */}
      {/* <HomeScreen /> */}
      <Button
        disabled={!request}
        title="Login"
        onPress={() => {
          promptAsync()
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
})