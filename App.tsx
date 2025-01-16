import { StyleSheet, View, StatusBar, Text } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import HomeScreen from './screens/HomeScreen'
import MapModal from './screens/MapModal'
import Banner from './components/Banner'
import { RootStackParamList } from './types/types'


const Stack = createNativeStackNavigator<RootStackParamList>()

function RootStack() {
    return (
        <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
                headerStyle: { backgroundColor: '#007AFF' },
            }}
        >
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen
                name="MapScreen"
                component={MapModal}
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ff2',
        alignItems: 'center',
        justifyContent: 'center',
    },
})
