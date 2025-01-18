import { StatusBar } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import HomeScreen from './screens/HomeScreen'
import MapScreen from './screens/MapScreen'
import { RootStackParamList } from './types/types'


const Stack = createNativeStackNavigator<RootStackParamList>()

function RootStack() {
    return (
        <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
                headerStyle: { backgroundColor: '#007AFF' },
                headerTitleStyle: { color: '#fff', fontWeight: 'bold' },
                headerTintColor: '#fff',
            }}
        >
            <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={{ title: 'Activity Sync'}}
                initialParams={{ refresh: false }}
            />
            <Stack.Screen
                name="MapScreen"
                component={MapScreen}
                options={{ title: 'Details'}}
                initialParams={{ activityData: '' }}/>
        </Stack.Navigator>
    )
}

export default function App() {
    return (
        <NavigationContainer>
            <StatusBar backgroundColor="#007AFF" barStyle="light-content"/>
            <RootStack />
        </NavigationContainer>
    )
}
