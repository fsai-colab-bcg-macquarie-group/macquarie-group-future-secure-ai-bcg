export function formatExpirationTime(expirationTime: string): string {
    const timeExpirationSeconds = parseInt(expirationTime, 10)
    const newExpirationTime = new Date(
        new Date().getTime() + timeExpirationSeconds * 1000,
    ).toISOString()
    return newExpirationTime
}
