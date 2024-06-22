import { useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { StyleSheet, Text, View, Button } from 'react-native'
import * as DocumentPicker from 'expo-document-picker'
import * as FileSystem from 'expo-file-system'
import { FileData } from './types/fileTypes'
import { convertOPHealthFileToGPX } from './utils/gpxUtils'


export default function App() {
  async function pickActivity () {
    const result: DocumentPicker.DocumentPickerResult = await DocumentPicker.getDocumentAsync({
      type: 'text/plain',
    })

    if (!result.canceled) {
        const uri: string = result.assets[0].uri
        console.log(uri)
        console.log(result)
        const file: string | undefined = await readFile(uri)
        if (file) {
          const fileJson: FileData = JSON.parse(file)
          const gpx: string = await convertOPHealthFileToGPX(fileJson)
          createAndWriteToFile(gpx)
          const uri: string = `${FileSystem.documentDirectory}testgpx.gpx`
          await readFile(uri)
          console.log(uri)
        }
      }
    else {
      console.log('cancelled')
    }
  }

  async function readFile (uri: string): Promise<string | undefined> {
    try {
      const content: string = await FileSystem.readAsStringAsync(uri)
      console.log(content)
      return content
    } catch (error) {
      console.error('Error reading file:', error)
    }
  }

  async function createAndWriteToFile (content: string) {
    try {
      const uri: string = `${FileSystem.documentDirectory}testgpx.gpx`

      await FileSystem.writeAsStringAsync(uri, content)

      console.log('File written successfully!')

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
