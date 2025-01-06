import { View, Text, StyleSheet, Dimensions } from 'react-native'

export default function Banner() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Activity Sync</Text>
        </View>
    )
}

const windowWidth = Dimensions.get('window').width

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#007AFF',
        height: 50,
        width: windowWidth,
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingHorizontal: 20,
    },
    text: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: 'bold',
    },
})