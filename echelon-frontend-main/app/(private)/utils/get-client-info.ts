import { getCookie } from '@services/cookie-service'

export type ClientInfo = {
  device: string
  browser: string
  browserVersion?: string
  ip?: string
}

export async function getClientInfo(): Promise<ClientInfo> {
  //   const deviceType = (await getCookie('deviceType')) || 'unknown'
  //   const browserVersion = (await getCookie('browserVersion')) || 'unknown'
  const device = navigator.platform
  const browser = (await getCookie('browserName')) || 'unknown'

  const fetchIP = async (): Promise<string> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json')
      const data = await response.json()
      return data.ip || 'Unknown'
    } catch (error) {
      console.error(
        'Error on getClientInfo: ',
        error,
        'Probably your internet connection is off',
      )
      throw error
    }
  }

  const ip = await fetchIP()

  return {
    device,
    browser,
    ip: ip || 'unknown',
  }
}
