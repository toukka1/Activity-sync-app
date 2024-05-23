import { useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { StyleSheet, Text, View, Button } from 'react-native'
import * as DocumentPicker from 'expo-document-picker'
import * as FileSystem from 'expo-file-system'


export default function App() {
  const pickActivity = async () => {
    const result: DocumentPicker.DocumentPickerResult = await DocumentPicker.getDocumentAsync({
      type: 'text/plain',
    })

    const uri: string = result.assets[0].uri
    await readFile(uri)
    await createAndWriteToFile()
  }

  const readFile = async (uri: string) => {
    try {
      const content: string = await FileSystem.readAsStringAsync(uri)
      console.log(content)
    } catch (error) {
      console.error('Error reading file:', error)
    }
  }

  const createAndWriteToFile = async () => {
    try {
      const uri: string = `${FileSystem.documentDirectory}test.txt`
      const content: string = 'Hello, this is some text content!'

      await FileSystem.writeAsStringAsync(uri, content)

      console.log('File written successfully!')
      console.log('reading file...')
      readFile(uri)
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
