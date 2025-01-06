import { ConfigContext, ExpoConfig } from '@expo/config'

export default ({ config }: ConfigContext): ExpoConfig => ({
    ...config,
    name: 'Activity sync',
    slug: 'activity-sync-app',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
        image: './assets/splash.png',
        resizeMode: 'contain',
        backgroundColor: '#ffffff'
    },
    scheme: 'myapp',
    plugins: [
        'expo-secure-store'
    ],
    android: {
        package: 'com.toukka1.activitysyncapp',
        config: {
            googleMaps: {
                apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
            },
        },
    },
    extra: {
        eas: {
            projectId: 'b05501ac-a1ae-4c05-ab26-082e7c1e121f'
        }
    }
})
