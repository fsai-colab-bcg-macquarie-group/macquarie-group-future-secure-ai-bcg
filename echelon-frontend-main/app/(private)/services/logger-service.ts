import { ILogSSOLoginRequest } from '@interfaces/logger/i-log-sso-login-request'
import httpClient from './http/client'
import { API_ROUTES } from './http/definitions'

export async function logSSOLogin(data: ILogSSOLoginRequest): Promise<void> {
  try {
    await httpClient.post(API_ROUTES.LOGGER.SSO_LOGIN, data)
  } catch (error) {
    console.error('[Error on logSSOLogin]: ', error)
    throw error
  }
}
