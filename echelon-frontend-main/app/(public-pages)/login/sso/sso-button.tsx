'use client'

import { useToast } from '@/app/(private)/contexts/context-toast'
import { handleSSOLogin } from '@/app/(public-pages)/login/login-actions'
import MicrosoftGray from '@assets/Microsoft_Gray_Logo.svg'
import Image from 'next/image'
import { getLoginMethodFromEnv } from './actions'
import { useEffect } from 'react'

export default function SsoButton(loginStates: {
  isSubmitting: boolean
  handleSubmit: (bool: boolean) => Promise<void>
}) {
  const { toastActions } = useToast()

  const onclickSSO = async () => {
    loginStates.handleSubmit(true)
    const result = await handleSSOLogin()
    if (result.success && result.url) {
      window.location.href = result.url
    } else {
      toastActions.showToast({
        title: 'SSO Error',
        description: result.message || 'An unknown error occurred.',
      })
      loginStates.handleSubmit(false)
    }
  }

  const checkLoginMethod = async () => {
    const method = await getLoginMethodFromEnv()
    if (method === 'sso') {
      loginStates.handleSubmit(false)
    }
  }

  useEffect(() => {
    checkLoginMethod()
  }, [])

  return (
    <div className="flex justify-center">
      <button
        type="button"
        onClick={onclickSSO}
        className="secondary_button !w-full !max-w-[100%]"
        disabled={loginStates.isSubmitting}

      >
        <div className="flex justify-center items-center gap-2">
          <Image
            src={MicrosoftGray}
          alt="Microsoft Gray Logo"
          style={{
            width: '30px',
            height: '30px',
            maxWidth: '30px',
            }}
          />
          Log in with Microsoft
        </div>
      </button>
    </div>
  )
}
