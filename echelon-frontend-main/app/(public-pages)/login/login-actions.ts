// Auth and cookies services
import { getSSOUrl, verifyEmail } from '@services/auth-service'
import { deleteAllCookies } from '@services/cookie-service'

// Interfaces imports

// Handles the verify email method from the AuthService
export async function handleVerifyEmail(email: string): Promise<boolean> {
  return !!(await verifyEmail(email, false).catch(() => false))
}

// Handles the SSO login method from the AuthService
export async function handleSSOLogin(): Promise<{
  success: boolean
  message?: string
  url?: string
}> {
  try {
    const url = await getSSOUrl()
    return { success: true, url }
  } catch (error: any) {
    return { success: false, message: error?.message }
  }
}

// Handles the clearAuthToken method from the AuthService

export async function clearAllAuthCookies() {
  await deleteAllCookies()
}
