'use server'

import { getCookie } from '@services/cookie-service'
import { API_ROUTES } from '@services/http/definitions'
import { PasswordResetSchema } from '@definitions/auth-definitions'

// Resetar a senha do usuário logado
export default async function resetUserPassword(
  formData: PasswordResetSchema,
  userEmail: string,
) {
  const [token, refreshToken] = await Promise.all([
    getCookie('token'),
    getCookie('refreshToken'),
  ])

  const body = {
    email: userEmail,
    password: formData.password,
    confirmPassword: formData.confirmPassword,
    accessToken: token,
    refreshToken: refreshToken,
  }

  try {
    const response = await fetch(
      process.env.ENV_API + '/' + API_ROUTES.AUTH.RESET_PASSWORD,
      {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'An unexpected error occurred')
    }

    await new Promise((resolve) => setTimeout(resolve, 3000))
    const responseData = await response.json()
    return {
      success: true,
      message: 'Password reset successful',
      data: responseData,
    }
  } catch (error: any) {
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        'An unexpected error occurred',
    }
  }
}
