'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { EmailForm } from './email-form'
import { PasswordForm } from './password-form'
export default function LoginForm(loginStates: {
  isSubmitting: boolean
  handleSubmit: (bool: boolean) => Promise<void>
}) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')

  const handleEmailSuccess = (email: string) => {
    loginStates.handleSubmit(false)
    setEmail(email)
    setStep(2)
  }

  const handleBackToEmail = () => {
    setEmail('')
    setStep(1)
  }

  const handleLoginSuccess = () => {
    router.push('/mfa-validate')
  }

  return step === 1 ? (
    <EmailForm
      onSuccess={handleEmailSuccess}
      value={'continue'}
      setSSOevent={loginStates.handleSubmit}
    />
  ) : (
    <PasswordForm
      email={email}
      onSuccess={handleLoginSuccess}
      onChangeEmail={handleBackToEmail}
      setSSOevent={loginStates.handleSubmit}
    />
  )
}
