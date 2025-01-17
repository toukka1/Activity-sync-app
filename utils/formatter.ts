function formatDate(date: number | undefined): string {
    if (!date) return ''

    const dateTime = new Date(date)

    return dateTime.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
    })
}

function formatDuration(seconds: number | undefined): string {
    if (!seconds) return ''

    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    const formattedMinutes = String(minutes).padStart(2, '0')
    const formattedSeconds = String(secs).padStart(2, '0')

    if (hours > 0) {
        const formattedHours = String(hours).padStart(2, '0')
        return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`
    } else {
        return `${formattedMinutes}:${formattedSeconds}`
    }
}

function formatPace(secondsPerKm: number | undefined): string {
    if (!secondsPerKm) return ''

    const minutes = Math.floor(secondsPerKm / 60)
    const seconds = secondsPerKm % 60

    const formattedMinutes = String(minutes)
    const formattedSeconds = String(seconds).padStart(2, '0')

    return `${formattedMinutes}:${formattedSeconds} /km`
}

export default {
    formatDate,
    formatDuration,
    formatPace
}
