import { useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

export function useDirectoryState() {
    const [directoryUri, setDirectoryUri] = useState<string | null>(null)

    useEffect(() => {
        const loadUri = async () => {
            const storedUri = await AsyncStorage.getItem('directoryUri')
            if (storedUri) setDirectoryUri(storedUri)
        }
        loadUri()
    }, [])

    const updateDirectoryUri = async (uri: string | null) => {
        setDirectoryUri(uri)
        if (uri) {
            await AsyncStorage.setItem('directoryUri', uri)
        } else {
            await AsyncStorage.removeItem('directoryUri')
        }
    }

    return { directoryUri, updateDirectoryUri }
}
