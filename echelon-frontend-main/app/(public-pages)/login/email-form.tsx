'use client'

import { Loader } from 'lucide-react'
import { emailSchema } from '@definitions/auth-definitions'
import { handleVerifyEmail } from '@/app/(public-pages)/login/login-actions'
import { useEffect, useState } from 'react'
import PrimaryBtn from '@/app/(private)/components/buttons/primary-btn'
import PrimaryInput from '@/app/(private)/components/inputs/primary-input'

interface EmailFormProps {
  onSuccess: (email: string) => void
  value: string
  isSubmittingOverride?: boolean
  setSSOevent: (bool: boolean) => Promise<void>
}

export function EmailForm({
  onSuccess,
  isSubmittingOverride,
  setSSOevent,
}: EmailFormProps) {
  const [isClient, setIsClient] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
  })
  const [errors, setErrors] = useState<{
    email?: string
  }>({})

  const clearError = (field: keyof typeof formData) => {
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const onSubmit = async (e: React.FormEvent) => {
    try {
      if (typeof setSSOevent === 'function') {
        await setSSOevent(true)
      }
    } catch (error) {
      console.error('Error setting SSO event:', error)
    }

    e.preventDefault()
    setIsSubmitting(true)

    try {
      const result = emailSchema.safeParse(formData)

      if (!result.success) {
        const validationErrors = result.error.flatten().fieldErrors
        setErrors({
          email: validationErrors.email?.[0],
        })
        setIsSubmitting(false)
        return
      }

      const emailLowerCase = formData.email.toLowerCase()
      const isEmailValid = await handleVerifyEmail(emailLowerCase)

      if (isEmailValid) {
        setErrors({})
        onSuccess(emailLowerCase)
        return
      }

      setErrors({
        email:
          'There was an issue processing your request. Please try again later.',
      })
    } catch (error: unknown) {
      setErrors({
        email:
          error instanceof Error ? error.message : 'An unknown error occurred',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (formData.email) {
      const lowercaseEmail = formData.email.toLowerCase()
      if (lowercaseEmail !== formData.email) {
        setFormData((prev) => ({ ...prev, email: lowercaseEmail }))
      }
    }
  }, [formData.email])

  useEffect(() => {
    if (isClient && typeof setSSOevent === 'function') {
      setSSOevent(false).catch((error) => {
        console.error('Error setting SSO event:', error)
      })
    }
  }, [isClient, setSSOevent])

  if (!isClient)
    return <Loader className="mx-auto my-10 h-6 w-6 animate-spin" />

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-8">
      <div className="mt-8 mb-3">
        <PrimaryInput
          placeholder="Email Address"
          value={formData.email}
          callback={(value) => {
            setFormData((prev) => ({ ...prev, email: value }))
            clearError('email')
          }}
          error={errors.email}
          disabled={isSubmitting}
          type="any"
        />
      </div>

      <div className="flex w-full justify-center">
        <PrimaryBtn
          text={
            isSubmitting || isSubmittingOverride ? 'Submitting...' : 'Continue'
          }
          type={'submit'}
          disabled={
            isSubmitting ||
            isSubmittingOverride ||
            !formData.email ||
            Boolean(errors.email)
          }
          className="text-center!"
        />
      </div>
    </form>
  )
}
