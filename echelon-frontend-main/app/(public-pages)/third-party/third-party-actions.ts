'use server'

import { handleLogSSOLogin } from '@app/(public-pages)/login/sso/logger-actions'
import { activeEmailSSO } from '@services/auth-service'
import { setCookie } from '@services/cookie-service'
import { jwtDecode } from 'jwt-decode'
import { redirect } from 'next/navigation'

export async function handleThirdParty({
  accessToken,
  refreshToken,
  type,
}: {
  accessToken: string
  refreshToken: string
  type: string | null
}) {
  if (type === 'invite') {
    await setCookie('token-TP', accessToken)
    await setCookie('refreshToken-TP', refreshToken)
    await setCookie('passwordResetCompleted', 'false')
    await setCookie('type', 'invite')
    redirect('/reset-password')
  }

  if (type === 'recovery') {
    await setCookie('token-TP', accessToken)
    await setCookie('refreshToken-TP', refreshToken)
    await setCookie('passwordResetCompleted', 'false')
    await setCookie('type', 'recovery')
    redirect('/reset-password')
  }

  if (type === 'invite-sso') {
    const statusCodde = await activeEmailSSO(accessToken)

    if (statusCodde === 200) {
      redirect('/login?successType=UserSSOActivated')
    }
    redirect('/login?errorType=UserActiveLinkExpired')
  }

  await setCookie('token', accessToken)
  await setCookie('refreshToken', refreshToken)
  await setCookie('isSSOUser', 'true')
  await setCookie('factorId', '')
  await setCookie('factorStatus', '')
  await setCookie('hasMFAValidated', 'false')

  const user = jwtDecode<any>(accessToken)

  await handleLogSSOLogin({
    email: user.email,
    userId: user.sub,
    status: 'success',
  })
}
