'use client'

import LoginForm from '@app/(public-pages)/login/login-form'
import FsaiLogoRow from '@assets/icons/fsai-logo-row'
import PartnerLogo from '@assets/icons/partner-logo'

import { LoginMethodType } from '@enum/login-method-type'

import { useEffect, useState } from 'react'
import { isLoginMethodIncluded } from './sso/actions'
import SsoLoginArea from './sso/sso-area'
import LoginSkeleton from './skeleton'

enum FSAILogoType {
  ROW = 'row',
  COLUMN = 'column',
}

export default function LoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(true)
  const [hasRegularLoginMethod, setHasRegularLoginMethod] = useState(false)
  const [hasSsoLoginMethod, setHasSsoLoginMethod] = useState(false)

  const handleSubmit = async (bool: boolean) => {
    setIsSubmitting(bool)
  }

  const loginStates = {
    isSubmitting,
    handleSubmit,
    hasSsoLoginMethod,
  }

  useEffect(() => {
    const fetchLoginMethods = async () => {
      const regularMethods = await isLoginMethodIncluded([
        LoginMethodType.BOTH,
        LoginMethodType.REGULAR,
      ])

      const ssoMethods = await isLoginMethodIncluded([
        LoginMethodType.BOTH,
        LoginMethodType.SSO,
      ])

      setHasRegularLoginMethod(regularMethods)
      setHasSsoLoginMethod(ssoMethods)
    }

    fetchLoginMethods()
  }, [])

  return (
    <main className="bg-background flex w-full">
      <aside className="mx-auto flex min-h-screen w-full flex-col items-center justify-center lg:w-3/5">
        <div className="flex h-full w-full flex-col justify-center shadow-primary bg-[var(--wall)] p-8 md:h-fit md:max-w-[500px] lg:h-fit lg:w-4/5">
          {!hasRegularLoginMethod && !hasSsoLoginMethod ? (
            <LoginSkeleton />
          ) : (
            <main className="relative mx-auto w-full max-w-96 overflow-scroll p-px sm:overflow-visible md:max-w-none">
              <FsaiLogoRow
                logoType={FSAILogoType.ROW}
                className={'login-col-logo w-full'}
              />
              <PartnerLogo className={'my-2 flex w-full justify-center'} />
              <h1 className="text-center text-[18px] font-semibold">
                Log In to FSAI
              </h1>
              {hasRegularLoginMethod && <LoginForm {...loginStates} />}
              {hasSsoLoginMethod && <SsoLoginArea {...loginStates} />}
            </main>
          )}
        </div>
      </aside>
    </main>
  )
}
