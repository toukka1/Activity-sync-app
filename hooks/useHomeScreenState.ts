import { useState } from 'react'
import { ActivityData } from '../types/types'

export function useHomeScreenState() {
    const [isModalVisible, setModalVisible] = useState(false)
    const [activityData, setActivityData] = useState<ActivityData | null>(null)
    const [previewEnabled, setPreviewEnabled] = useState(true)

    function togglePreview() {
        setPreviewEnabled((prev) => !prev)
    }

    function closeModal() {
        setModalVisible(false)
        setActivityData(null)
    }

    return {
        isModalVisible,
        setModalVisible,
        activityData,
        setActivityData,
        previewEnabled,
        togglePreview,
        closeModal,
    }
}

