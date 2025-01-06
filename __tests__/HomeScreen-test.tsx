import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react-native'
import HomeScreen from '../screens/HomeScreen'
import { HandleActivityUploadType } from '../types/types'

// Temporarily mock react native maps and mapmodal for now
jest.mock('react-native-maps', () => {
    const React = require('react')
    const { View } = require('react-native')
    const { forwardRef } = React

    const MockMapView = forwardRef((props: any, ref: React.Ref<any>) => (
        <View ref={ref} {...props} />
    ))
    MockMapView.displayName = 'MockMapView'

    return {
        __esModule: true,
        default: MockMapView,
        Marker: View,
        Callout: View,
        PROVIDER_GOOGLE: 'google',
    }
})

jest.mock('../screens/MapModal', () => {
    const React = require('react')
    const { View, Text } = require('react-native')

    const MockMapModal = () => (
        <View>
            <Text>Mocked MapModal</Text>
        </View>
    )
    MockMapModal.displayName = 'MockMapModal'

    return MockMapModal
})

const promptAsyncMock = jest.fn().mockResolvedValue({ type: 'success' })
const disconnectMock = jest.fn().mockResolvedValue(undefined)

const mockAuthService = jest.fn(() => ({
    isConnected: true,
    isLoading: false,
    promptAsync: promptAsyncMock,
    disconnect: disconnectMock,
    request: null,
}))

const mockActivityService: HandleActivityUploadType = jest.fn().mockResolvedValue({
    activityData: { /* Mock ActivityData */ },
    gpxFilePath: '/mock/path.gpx',
})

describe('<HomeScreen />', () => {
    test('Text renders correctly on HomeScreen', async () => {
        const { getByText } = render(
            <HomeScreen
                authService={mockAuthService}
                activityService={mockActivityService}
            />
        )

        const text = await waitFor(() => getByText('Choose an activity to upload'))
        expect(text).toBeTruthy()
    })

    test('Switch toggles preview mode', async () => {
        const { getByText, getByRole } = render(
            <HomeScreen
                authService={mockAuthService}
                activityService={mockActivityService}
            />
        )

        const switchElement = getByRole('switch')
        expect(switchElement.props.value).toBe(true)

        fireEvent(switchElement, 'onValueChange', true)
        const updatedText = getByText('Enable Map Preview')

        expect(updatedText).toBeTruthy()
        expect(switchElement.props.value).toBe(false)
    })

    test('Browse button toggles enabled state based on connection', async () => {
        // Connected state
        const { getByText, rerender } = render(
            <HomeScreen
                authService={mockAuthService}
                activityService={mockActivityService}
            />
        )
        const browseButton = getByText('Browse')
        expect(browseButton).toBeEnabled()

        // Disconnected state
        mockAuthService.mockReturnValueOnce({ ...mockAuthService(), isConnected: false })
        rerender(
            <HomeScreen
                authService={mockAuthService}
                activityService={mockActivityService}
            />
        )
        expect(browseButton).toBeDisabled()
    })

    test('Calls activityService on file upload', async () => {
        const { getByText } = render(
            <HomeScreen
                authService={mockAuthService}
                activityService={mockActivityService}
            />
        )

        const browseButton = getByText('Browse')
        fireEvent.press(browseButton)

        await waitFor(() => {
            expect(mockActivityService).toHaveBeenCalledWith(true)
        })
    })

    test('Connect button triggers connection flow', async () => {
        // Disconnected state
        mockAuthService.mockReturnValueOnce({ ...mockAuthService(), isConnected: false })

        const { getByText } = render(
            <HomeScreen
                authService={mockAuthService}
                activityService={mockActivityService}
            />
        )

        const connectButton = getByText('Connect to Strava')
        fireEvent.press(connectButton)

        await waitFor(() => {
            expect(mockAuthService().promptAsync).toHaveBeenCalled()
        })
    })

    test('Disconnect button triggers disconnect flow', async () => {
        const { getByText } = render(
            <HomeScreen
                authService={mockAuthService}
                activityService={mockActivityService}
            />
        )

        const disconnectButton = getByText('Disconnect')
        fireEvent.press(disconnectButton)

        await waitFor(() => {
            expect(mockAuthService().disconnect).toHaveBeenCalled()
        })
    })

    test('Does not crash when disconnect or connect is pressed while loading', async () => {
        const loadingAuthService = jest.fn(() => ({
            isConnected: true,
            isLoading: true,
            promptAsync: jest.fn().mockResolvedValue({ type: 'success' }),
            disconnect: jest.fn().mockResolvedValue(undefined),
            request: null,
        }))

        const { getByText } = render(
            <HomeScreen
                authService={loadingAuthService}
                activityService={mockActivityService}
            />
        )

        const disconnectButton = getByText('Disconnect')
        fireEvent.press(disconnectButton)

        await waitFor(() => {
            expect(loadingAuthService().disconnect).not.toHaveBeenCalled()
        })
    })
})
