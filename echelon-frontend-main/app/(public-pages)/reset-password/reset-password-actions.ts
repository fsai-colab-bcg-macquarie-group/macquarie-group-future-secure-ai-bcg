'use server'

// Auth and Cookie services
import {
  updatePassword,
  resetPasswordByEmail,
  createNewPassword,
} from '@services/auth-service'
import { getCookie, setCookie } from '@services/cookie-service'
import { redirect } from 'next/navigation'
import { clearAllAuthCookies } from '../login/login-actions'

// Sends an email to the user with the reset password link
export async function sendResetPasswordEmail(email: string): Promise<void> {
  await resetPasswordByEmail(email)
}

// Sets the password reset completed cookie
export async function setPasswordResetCompleted(ok: string) {
  await setCookie('passwordResetCompleted', ok)
}

// Pegar o token e o refreshToken do cookie para resetar a senha
export async function getTokenAndRefreshTokenTP() {
  const [token, refreshToken] = await Promise.all([
    getCookie('token-TP') || getCookie('token'),
    getCookie('refreshToken-TP') || getCookie('refreshToken'),
  ])
  return { token, refreshToken }
}

// Handles the password reset
export async function handlePasswordReset({
  password,
  confirmPassword,
}: {
  password: string
  confirmPassword: string
}): Promise<any> {
  const [token, refreshToken, type] = await Promise.all([
    getCookie('token-TP'),
    getCookie('refreshToken-TP'),
    getCookie('type'),
  ])
  if (type === 'invite') {
    await createNewPassword({
      password,
      confirmPassword,
      token,
      refreshToken,
    })
  }
  if (type === 'recovery') {
    return await updatePassword({
      password,
      confirmPassword,
      token,
      refreshToken,
    })
  }

  await setPasswordResetCompleted('true')
  await clearAllAuthCookies()
  redirect('/')
}
