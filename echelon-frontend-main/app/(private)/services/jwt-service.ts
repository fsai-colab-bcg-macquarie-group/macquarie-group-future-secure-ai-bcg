'use server'

// JwtService is a class that contains methods to handle JWT tokens.
import { jwtDecode } from 'jwt-decode'

// Cookie service is a service that contains methods to handle cookies.
import { setCookie, getCookie } from '@services/cookie-service'

// JwtPayload is an interface that defines the structure of the JWT payload.
import { JwtPayload } from '@/app/(private)/interfaces/auth/i-jwt-payload'

// Http client is a service that contains methods to handle HTTP requests.
import { API_ROUTES } from './http/definitions'
import httpClient from './http/client'

// This function checks if a token is expired.
export async function isTokenExpired(token: string): Promise<boolean> {
  try {
    const decoded = jwtDecode<JwtPayload>(token)

    if (decoded.exp && Date.now() > decoded.exp * 1000) {
      return true
    }
    return false
  } catch (error) {
    console.error(
      '[isTokenExpired]: Error on tryng to check if token is expired.',
    )
    throw error
  }
}

// Add this function to check if the token is about to expire
export async function isTokenAboutToExpire(token: string): Promise<boolean> {
  try {
    const decoded = jwtDecode<JwtPayload>(token)

    if (!decoded.exp) return false

    const expirationTime = decoded.exp * 1000 // Convert to milliseconds
    const currentTime = Date.now()
    const timeUntilExpiration = expirationTime - currentTime

    // Check if there is less than 1 minute left to expire
    const oneMinuteInMs = 60 * 1000
    return timeUntilExpiration <= oneMinuteInMs && timeUntilExpiration > 0
  } catch (error) {
    console.error(
      '[isTokenAboutToExpire]: Erro ao verificar expiração do token',
      error,
    )
    return false
  }
}

// This function refreshes the acessToken and return the new access token and refreshToken.
export async function refreshAccessToken(
  refreshToken: string,
): Promise<boolean> {
  try {
    // Get the current token
    const currentToken = await getCookie('token')

    // If there is no current token, there is nothing to verify
    if (!currentToken) {
      return false
    }

    // Check if the token is about to expire
    const shouldRefresh = await isTokenAboutToExpire(currentToken)

    // If the token is not about to expire, return true without refreshing
    if (!shouldRefresh) {
      return true
    }

    // If the token is about to expire, refresh it
    const response = await httpClient.post<any>(API_ROUTES.AUTH.REFRESH_TOKEN, {
      refreshToken: refreshToken,
    })
    await setCookie('refreshToken', response.data.data.refreshToken)
    await setCookie('token', response.data.data.accessToken)

    return true
  } catch (error) {
    console.error('[Error on refreshAccessToken]: ', error)
    return false
  }
}

// This function forces the refresh of the token without checking the expiration
export async function forceRefreshAccessToken(): Promise<boolean> {
  try {
    const refreshToken = await getCookie('refreshToken')

    // If there is no refresh token, return false
    if (!refreshToken) {
      return false
    }

    // Force the refresh
    const response = await httpClient.post<any>(API_ROUTES.AUTH.REFRESH_TOKEN, {
      refreshToken: refreshToken,
    })
    await setCookie('refreshToken', response.data.data.refreshToken)
    await setCookie('token', response.data.data.accessToken)

    return true
  } catch (error) {
    console.error('[Error on forceRefreshAccessToken]: ', error)
    return false
  }
}

// This function extracts the token information.
export async function extractTokenInfo(
  token: string,
): Promise<JwtPayload | null> {
  try {
    return jwtDecode<JwtPayload>(token)
  } catch (error) {
    console.error(
      '[extractTokenInfo]: Error during extract token information process',
    )
    throw error
  }
}
