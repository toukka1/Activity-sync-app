import { StyleSheet, Text, View, Button } from 'react-native'
import handleFileUpload from '../services/fileService'

export default function Home() {

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Choose activities to upload</Text>
      <Button title="Browse" onPress={handleFileUpload} />
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