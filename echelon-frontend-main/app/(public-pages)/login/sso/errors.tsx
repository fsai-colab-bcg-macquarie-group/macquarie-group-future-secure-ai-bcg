'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { authResponseTypeMap } from '@/app/(public-pages)/login/sso/auth-response-type-map'
import { useState, Suspense, useEffect } from 'react'
import { useToast } from '@/app/(private)/contexts/context-toast'

function ErrorsBody() {
  const searchParams = useSearchParams()
  const errorType = searchParams.get('errorType')
  const successType = searchParams.get('successType')

  const errorMessageType =
    authResponseTypeMap[errorType as keyof typeof authResponseTypeMap]
  const successMessageType =
    authResponseTypeMap[successType as keyof typeof authResponseTypeMap]

  const [errorMessage] = useState<string | null>(errorType && errorMessageType)
  const [successMessage] = useState<string | null>(
    successType && successMessageType,
  )

  const { toastActions } = useToast()

  const router = useRouter()

  //newest
  const noSSOerror =
    typeof window !== 'undefined'
      ? window.location.hash.includes('error')
      : false

  useEffect(() => {
    if (errorMessage) {
      toastActions.showToast({
        title: 'SSO Error',
        description: errorMessage,
      })
      router.push('/')
    }

    if (noSSOerror) {
      const message = process.env.NEXT_PUBLIC_SUPPORT_EMAIL
        ? `Your activation link has expired. Please contact support to request a new activation link at ${process.env.NEXT_PUBLIC_SUPPORT_EMAIL}`
        : 'Unknown error'
      toastActions.showToast({
        title: 'Error',
        description: message,
      })
    }
  }, [errorMessage, successMessage, noSSOerror])

  return (
    <>
      {/* {errorMessage && (
        <p className="mt-5 text-center text-red-500">{errorMessage}</p>
      )}
      {successMessage && (
        <p className="mt-5 text-center text-green-500">{successMessage}</p>
      )} */}
    </>
  )
}

export default function Errors() {
  return (
    <Suspense fallback={<></>}>
      <ErrorsBody />
    </Suspense>
  )
}
