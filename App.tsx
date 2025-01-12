import { StyleSheet, View, StatusBar } from 'react-native'
import HomeScreen from './screens/HomeScreen'
import Banner from './components/Banner'
import { handleActivityUpload } from './services/activityService'
import { useStravaAuthRequest } from './services/authService'

export default function App() {

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor="#007AFF" barStyle="light-content"/>
            <Banner />
            <HomeScreen
                activityService={handleActivityUpload}
                authService={useStravaAuthRequest}
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
