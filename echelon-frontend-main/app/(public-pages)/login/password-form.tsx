'use client'

import { Eye, EyeOff, Loader } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import PrimaryBtn from '@/app/(private)/components/buttons/primary-btn'
import SecondaryBtn from '@/app/(private)/components/buttons/secondary-btn'
import PrimaryInput from '@/app/(private)/components/inputs/primary-input'
import { login } from '@/app/(private)/services/auth-service'
import { loginSchema, LoginSchema } from '@definitions/auth-definitions'
import { getClientInfo } from '@utils/get-client-info'

interface PasswordFormProps {
  email: string
  onSuccess: () => void
  onChangeEmail: () => void
  setSSOevent: (bool: boolean) => Promise<void>
}

export function PasswordForm({
  email,
  onSuccess,
  onChangeEmail,
  setSSOevent,
}: PasswordFormProps) {
  const [isClient, setIsClient] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState<LoginSchema>({
    email,
    password: '',
  })
  const [errors, setErrors] = useState<{
    password?: string
  }>({})
  const clearError = (field: keyof LoginSchema) => {
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  // this function is fully commented because we used AI to organize the execution order
  const onSubmit = async (e: React.FormEvent) => {
    setSSOevent(true)
    e.preventDefault()
    setIsSubmitting(true)
    setShowPassword(false)

    try {
      // Validação do schema
      const result = loginSchema.safeParse(formData)

      if (!result.success) {
        const validationErrors = result.error.flatten().fieldErrors
        setErrors({
          password: validationErrors.password?.[0],
        })
        setIsSubmitting(false)
        setSSOevent(false)
        return
      }

      // Get client information
      const clientInfo = await getClientInfo()

      // Call the login function with the necessary data
      const loginResult = await login({
        email: formData.email,
        password: formData.password,
        headerData: {
          ip: clientInfo.ip,
          device: clientInfo.device,
          browser: clientInfo.browser,
        },
      })

      // Check if the login was successful
      if (loginResult.success) {
        setErrors({}) // Clear previous errors
        onSuccess() // Success function

        return
      }

      // If the login fails, define the error
      setErrors({
        password: loginResult.message, // Display the login error message
      })
      setIsSubmitting(false)
      setSSOevent(false)
    } catch (error: unknown) {
      // Handle unexpected errors and define the error
      setErrors({
        password:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred', // Generic message if it's not an Error object
      })
      setIsSubmitting(false)
      setSSOevent(false)
    }
  }

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (isClient) {
      setSSOevent(false)
    }
  }, [isClient])

  if (!isClient)
    return <Loader className="mx-auto my-10 h-8 w-8 animate-spin" />

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-8">
      <div className="relative mt-10 justify-between sm:inline-flex">
        <PrimaryInput
          readOnly={true}
          disabled={true}
          value={email}
          placeholder="Email Address"
        />
        <button
          type="button"
          className={`text-gray1300 absolute top-[62%] right-0 -translate-y-1/2 bg-white px-2 py-0 text-[14px] ${
            isSubmitting ? 'opacity-50' : 'hover:underline'
          } sm:rounded-none`}
          disabled={isSubmitting}
          onClick={onChangeEmail}
        >
          Change
        </button>
      </div>
      <div>
        <div className="relative w-full">
          <PrimaryInput
            placeholder="Enter Password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            callback={(value) => {
              setFormData((prev) => ({ ...prev, password: value }))
              clearError('password')
            }}
            error={errors.password}
            disabled={isSubmitting}
          />

          {!errors.password &&
            formData.password.length > 0 &&
            !isSubmitting && (
              <div
                className="absolute top-1/2 right-0 -translate-y-2 cursor-pointer opacity-80"
                onClick={() => setShowPassword(!showPassword)}
              >
                <div className="bg-white p-1">
                  {showPassword ? (
                    <EyeOff className="text-gray1300 stroke-[1.6px] p-px" />
                  ) : (
                    <Eye className="text-gray1300 stroke-[1.6px] p-px" />
                  )}
                </div>
              </div>
            )}
        </div>
      </div>

      <div className="mt-4 flex flex-col items-center">
        <div className="flex w-full justify-center">
          <PrimaryBtn
            text={isSubmitting ? 'Submitting...' : 'Login'}
            type="submit"
            disabled={
              isSubmitting || !formData.password || Boolean(errors.password)
            }
            className="text-center!"
          />
        </div>
        <div className="mt-3" />
        <Link href={'/forgot-password'}>
          <SecondaryBtn
            text={"Can't Login?"}
            disabled={isSubmitting}
            className="text-center!"
          />
        </Link>
      </div>
    </form>
  )
}
