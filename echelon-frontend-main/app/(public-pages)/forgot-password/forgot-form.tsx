'use client'

import { useState } from 'react'
import { EmailForm } from '@/app/(public-pages)/login/email-form'
import { RecoverySent } from '@/app/(public-pages)/forgot-password/recovery-sent'
import { sendResetPasswordEmail } from '@/app/(public-pages)/reset-password/reset-password-actions'

import { clearAllAuthCookies } from '@/app/(public-pages)/login/login-actions'
import SecondaryBtn from '@/app/(private)/components/buttons/secondary-btn'
import { redirect } from 'next/navigation'

export default function ForgotPasswordForm() {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isSubmittingOverride, setIsSubmittingOverride] = useState(false)

  const handleEmailSuccess = async (email: string) => {
    setEmail(email)
    setIsSubmittingOverride(true)
    try {
      await sendResetPasswordEmail(email)
    } catch {
      setError(
        'Too many requests. Please wait a few minutes before trying again.',
      )
      setIsSubmittingOverride(false)
      return
    }
    setIsSubmittingOverride(false)
    setStep(2)
  }

  const handleCancelPasswordRecovery = async () => {
    await clearAllAuthCookies()
    redirect('/login')
  }

  return step === 1 ? (
    <div className="flex flex-col items-center">
      <EmailForm
        onSuccess={handleEmailSuccess}
        value="Send Recovery Link"
        isSubmittingOverride={isSubmittingOverride}
      />
      {error && (
        <div className="my-5">
          <div className="text-center text-sm text-red-500">{error}</div>
        </div>
      )}
      <div className="my-2" />
      <div onClick={handleCancelPasswordRecovery}>
        <SecondaryBtn
          text="Return to login"
          className="text-center!"
          disabled={isSubmittingOverride}
        />
      </div>
    </div>
  ) : (
    <RecoverySent email={email} />
  )
}
