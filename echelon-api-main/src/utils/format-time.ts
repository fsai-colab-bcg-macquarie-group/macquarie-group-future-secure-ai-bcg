export function formatRemainingTime(seconds: number): string {
    const years = Math.floor(seconds / (3600 * 24 * 365.25)) // Considering leap years
    const days = Math.floor((seconds % (3600 * 24 * 365.25)) / (3600 * 24))
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    if (years) return `${years} year${years > 1 ? 's' : ''}`

    if (days > 0) return `${days} day${days > 1 ? 's' : ''}`

    if (hours > 0)
        return `${hours} hour${hours > 1 ? 's' : ''} and ${String(minutes).padStart(2, '0')} minute${minutes > 1 ? 's' : ''}`

    if (minutes > 0)
        return `${String(minutes).padStart(2, '0')} minute${minutes > 1 ? 's' : ''}`

    return `${String(seconds).padStart(2, '0')} second${seconds > 1 ? 's' : ''}`
}
