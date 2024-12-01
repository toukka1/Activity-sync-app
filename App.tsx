import { StyleSheet, View, StatusBar} from 'react-native'
import HomeScreen from './screens/HomeScreen'
import Banner from './components/Banner'

export default function App() {

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#007AFF" barStyle="light-content"/>
      <Banner />
      <HomeScreen />
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
