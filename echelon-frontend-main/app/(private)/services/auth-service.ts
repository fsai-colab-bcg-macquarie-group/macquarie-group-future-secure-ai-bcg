'use server'

// Interfaces
import { ILoginCredentials } from '@interfaces/auth/i-login-crentials'

// HTTP Definitions
import { API_ROUTES } from './http/definitions'

// Http client is a service that contains methods to handle HTTP requests.
import httpClient from './http/client'
import { isTokenExpired, refreshAccessToken } from './jwt-service'
import {
  deleteAllCookies,
  getCookie,
  setCookie,
} from '@services/cookie-service'
import axiosClient from './http/http-client'
import { Response } from './http/types'

// This route is public, dont need authentication token
export async function verifyEmail(
  email: string,
  allUsers: boolean,
): Promise<boolean> {
  if (!(await isAuthTokenValid())) await deleteAllCookies()

  try {
    const response = await httpClient.post<any>(API_ROUTES.AUTH.VERIFY_EMAIL, {
      email,
      allUsers,
    })
    if (response.data.statusCode === 200) return true
    return true
  } catch {
    return false
  }
}

export async function getUserIdByEmail(
  email: string,
  allUsers: boolean,
): Promise<Response> {
  try {
    const url = API_ROUTES.AUTH.VERIFY_EMAIL
    const body = {
      email,
      allUsers,
    }
    return await axiosClient.post<Response>(url, body)
  } catch (error) {
    console.error('[Error on getUserIdByEmail]: ', error)
    throw error
  }
}

// This function sends a request with credentials to the server to login an user.
export async function login(credentials: ILoginCredentials) {
  await deleteAllCookies()

  try {
    // Send request to server
    const response = await httpClient.post(API_ROUTES.AUTH.LOGIN, credentials)

    // Verifica se o código de status é 200
    if (response.data.statusCode === 200) {
      // Store tokens in cookie using the new hooks system
      await setCookie('token', response.data.data.accessToken)
      await setCookie('refreshToken', response.data.data.refreshToken)

      // Return success response
      return { success: true, data: response.data }
    }

    // If the statusCode is not 200, throw an error with the message
    throw new Error(response.data.message)
  } catch (error: any) {
    // Return an object with the 'success' key as false and the error message
    return {
      success: false,
      message:
        error.response?.data?.message ??
        error.message ??
        'An unexpected error occurred',
    }
  }
}

// This function checks if the AuthToken is valid.
export async function isAuthTokenValid(): Promise<boolean> {
  const token = await getCookie('token')
  const refreshToken = await getCookie('refreshToken')

  if (token && refreshToken) {
    const isExpired = await isTokenExpired(token)
    if (isExpired) {
      await signOut()
      return false
    }

    return await refreshAccessToken(refreshToken)
  }
  return false
}

// This function sends a request to the server to logout.
export async function signOut() {
  try {
    const response = await axiosClient.post<Response>(API_ROUTES.AUTH.SIGN_OUT)
    if (response) {
      return { success: true, data: response }
    }
  } catch (error) {
    console.error('[Error on signOut]: ', error)
    return { success: false, message: error }
  }
}

// This function sends a request to the server to get SSO URL.
export async function getSSOUrl(): Promise<string> {
  try {
    const response = await httpClient.post<any>(API_ROUTES.AUTH.SSO_URL, {})

    return response.data.data.url
  } catch (error: any) {
    console.error('[Error on getSSOUrl]: ', error.message)
    throw error
  }
}

// This function sends a request to the server to reset the password by email, user needs receive an email.
export async function resetPasswordByEmail(email: string): Promise<void> {
  try {
    await httpClient.post(API_ROUTES.AUTH.RESET_PASSWORD_BY_EMAIL, { email })
  } catch (error) {
    throw error
  }
}

// This function sends a request to the server to create a new password.
export async function createNewPassword({
  password,
  confirmPassword,
  token,
  refreshToken,
}: {
  password: string
  confirmPassword: string
  token: string | null
  refreshToken: string | null
}): Promise<void> {
  try {
    await httpClient.post(API_ROUTES.USERS.UPDATE_PASSWORD, {
      password,
      confirmPassword,
      accessToken: token,
      refreshToken,
    })
  } catch (error) {
    throw error
  }
}

// This function sends a request to the server to create a new password.
export async function updatePassword({
  password,
  confirmPassword,
  token,
  refreshToken,
}: {
  password: string
  confirmPassword: string
  token: string | null
  refreshToken: string | null
}): Promise<Response> {
  try {
    const result = await httpClient.post(API_ROUTES.AUTH.RESET_PASSWORD, {
      password,
      confirmPassword,
      accessToken: token,
      refreshToken,
    })
    return result.data
  } catch (error: any) {
    console.error('[Error on updatePassword]: ', error)
    return {
      success: false,
      message:
        error.response?.data?.message ??
        error.message ??
        'An unexpected error occurred',
      data: null,
      statusCode: error.response?.status ?? 500,
    }
  }
}

// This function sends a request to the server to verify the email.
export async function activeEmailSSO(code: string): Promise<number> {
  await deleteAllCookies()

  try {
    const response = await fetch(
      `${process.env.ENV_API}/${API_ROUTES.AUTH.ACTIVE_EMAIL_SSO}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code,
        }),
      },
    )

    const data = await response.json()
    return data.statusCode
  } catch (error: any) {
    console.error('[Error on activeEmailSSO]: ', error.message)
    return error.status ?? 500
  }
}

export async function enrollMFA(friendlyName: string) {
  try {
    const url = API_ROUTES.AUTH.MFA_ENROLL

    const token = await getCookie('token')

    const response = await fetch(process.env.ENV_API + '/' + url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
      body: JSON.stringify({
        factorType: 'totp',
        friendlyName: friendlyName,
      }),
    })
    return response.json()
  } catch (error) {
    console.error('[Error on enrollMFA]: ', error)
    throw error
  }
}

export async function unenrollMFA({ factorId }: { factorId: string }) {
  try {
    const response = await httpClient.post(API_ROUTES.AUTH.MFA_UNENROLL, {
      factorId,
    })
    return response.data
  } catch (error) {
    return error
  }
}

export async function verifyMFA({
  factorId,
  challengeId,
  verifyCode,
}: {
  factorId: string
  challengeId: string
  verifyCode: string
}) {
  try {
    const response = await httpClient.post(API_ROUTES.AUTH.MFA_VERIFY, {
      factorId: factorId,
      challengeId: challengeId,
      code: verifyCode,
    })
    return response.data
  } catch (error) {
    return error
  }
}

export async function checkAuthenticatorAssuranceLevel() {
  try {
    const response = await httpClient.post(
      API_ROUTES.AUTH.MFA_CHECK_AUTHENTICATOR_ASSURANCE_LEVEL,
      {},
    )
    return response.data
  } catch (error) {
    return error
  }
}

export async function challengeVerifyMFA(
  verifyCode: string,
  factorId: string,
  ip: string,
) {
  let headers = {}
  if (ip) {
    headers = {
      'X-Forwarded-For': ip,
    }
  }
  try {
    const response = await httpClient.post(
      API_ROUTES.AUTH.MFA_CHALLENGE_VERIFY,
      {
        code: verifyCode,
        factorId: factorId,
      },
      headers,
    )
    return response.data
  } catch (error) {
    return error
  }
}

export async function verifyChallenge(factorId: string) {
  try {
    const response = await httpClient.post(
      API_ROUTES.AUTH.MFA_VERIFY_CHALLENGE,
      {
        factorId: factorId,
      },
    )
    return response.data
  } catch (error) {
    return error
  }
}

export async function removeUnverifiedFactors() {
  try {
    const response = await httpClient.post(
      API_ROUTES.AUTH.MFA_REMOVE_UNVERIFIED_FACTORS,
      {},
    )
    return response.data
  } catch (error) {
    return error
  }
}

export async function listMFAEnrolled() {
  try {
    const response = await httpClient.post(API_ROUTES.AUTH.MFA_LIST, {})
    return response.data
  } catch (error) {
    return error
  }
}
