import { useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { StyleSheet, Text, View, Button } from 'react-native'
import * as DocumentPicker from 'expo-document-picker'
import * as FileSystem from 'expo-file-system'



export default function App() {
  const [fileUri, setFileUri] = useState('')

  const pickActivity = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'text/plain',
    })

    setFileUri(result.assets[0].uri)
    readFile()
    createAndWriteToFile()
  }

  const readFile = async () => {
    try {
      const content = await FileSystem.readAsStringAsync(fileUri)
      console.log(content)
    } catch (error) {
      console.error('Error reading file:', error)
    }
  }

  const createAndWriteToFile = async () => {
    try {
      const uri = `${FileSystem.documentDirectory}test.txt`
      setFileUri(uri)
      const content = 'Hello, this is some text content!'

      await FileSystem.writeAsStringAsync(fileUri, content)

      console.log('File written successfully!')
      console.log('reading file...')
      readFile()
    } catch (error) {
      console.error('Error writing file:', error)
    }
  }


  console.log('moi')
  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
      <Button title="Pick an activity" onPress={pickActivity} />
      <StatusBar style="auto" />
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
