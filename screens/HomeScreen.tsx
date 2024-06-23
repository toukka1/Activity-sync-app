import { StyleSheet, Text, View, Button } from 'react-native'
import handleFileUpload from '../services/fileService'
import { useStravaAuthRequest } from '../services/authService'

export default function Home() {
  const { request, promptAsync } = useStravaAuthRequest()

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Choose activities to upload</Text>
      <Button title="Browse" onPress={handleFileUpload} />
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
  text: {
    color: '#808080',
    fontSize: 15,
    fontWeight: 'bold',
  },
})
