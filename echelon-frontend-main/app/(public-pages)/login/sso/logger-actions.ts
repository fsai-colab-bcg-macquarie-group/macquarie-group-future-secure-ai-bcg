import { logSSOLogin } from '@services/logger-service'
import { ILogSSOLoginRequest } from '@interfaces/logger/i-log-sso-login-request'
import { getClientInfo } from '@utils/get-client-info'

// This handler logs the SSO login
export async function handleLogSSOLogin(data: ILogSSOLoginRequest): Promise<{
  success: boolean
  message?: string
}> {
  try {
    const info = await getClientInfo()
    await logSSOLogin({
      ...data,
      headerData: info,
    })
    return { success: true, message: 'Logged in' }
  } catch (error: any) {
    return { success: false, message: error?.message }
  }
}
