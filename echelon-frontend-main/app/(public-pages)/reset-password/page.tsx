'use client'

import { useEffect, useState } from 'react'
import FsaiLogo from '@assets/icons/fsai-logo-row'
import PartnerLogo from '@assets/icons/partner-logo'
import {
  passwordResetSchema,
  PasswordResetSchema,
} from '@definitions/auth-definitions'
import { Eye, EyeClosed } from 'lucide-react'
import PrimaryInput from '@components/inputs/primary-input'
import PrimaryBtn from '@components/buttons/primary-btn'
import { useToast } from '@contexts/context-toast'
import { redirect } from 'next/navigation'
import {
  getTokenAndRefreshTokenTP,
  handlePasswordReset,
  setPasswordResetCompleted,
} from './reset-password-actions'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Logo from '@assets/FSAI_Logo_Row.svg'
import { clearAllAuthCookies } from '../login/login-actions'

enum FSAILogoType {
  ROW = 'row',
  COLUMN = 'column',
}

export default function NewPasswordForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [formData, setFormData] = useState<PasswordResetSchema>({
    password: '',
    confirmPassword: '',
  })

  const [errors, setErrors] = useState<{
    password?: string
    confirmPassword?: string
  }>({})

  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toastActions } = useToast()

  // Redirect logic for route protection ----------------------
  const [isLoading, setIsLoading] = useState(true)
  const onLoad = async () => {
    setIsLoading(true)
    const { token, refreshToken } = await getTokenAndRefreshTokenTP()

    if (!token && !refreshToken) {
      return router.push('/login')
    }
    setIsLoading(false)
  }
  useEffect(() => {
    onLoad()
  }, [])
  // ----------------------------------------------------------------

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Validation of the form data with the schema
    const result = passwordResetSchema.safeParse(formData)

    if (!result.success) {
      const validationErrors = result.error.flatten().fieldErrors
      setErrors({
        password: validationErrors.password?.[0],
        confirmPassword: validationErrors.confirmPassword?.[0],
      })
      setIsSubmitting(false)
      return
    }

    // Hide the password and confirm password fields after validation
    setShowPassword(false)
    setShowConfirmPassword(false)

    const resetResult = await handlePasswordReset(formData)

    if (resetResult.success) {
      toastActions.showToast({
        title: 'Password Reset',
        description:
          'Password reset successfully, please login with your new password',
      })

      setIsSubmitting(false)
      await clearAllAuthCookies()
      await setPasswordResetCompleted('true')
      redirect('/login')
    } else {
      toastActions.showToast({
        title: 'Password Reset Error',
        description: 'An error occurred while resetting the password',
      })
      setIsSubmitting(false)
    }
  }

  const clearError = (field: keyof PasswordResetSchema) => {
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  useEffect(() => {
    if (errors.password || errors.confirmPassword) {
      const timer = setTimeout(() => {
        clearError('password')
        clearError('confirmPassword')
      }, 3500)
      return () => clearTimeout(timer)
    }
  }, [errors.password, errors.confirmPassword, clearError])

  return !isLoading ? (
    <main className="flex w-full">
      <aside className="mx-auto flex min-h-screen w-full flex-col items-center justify-center lg:w-3/5">
        <div className="flex h-full w-full flex-col justify-center bg-[var(--wall)] p-8 md:h-fit md:max-w-[500px] lg:h-fit lg:w-4/5">
          <main className="mx-auto w-full max-w-96 overflow-scroll p-px sm:overflow-visible md:max-w-none">
            <FsaiLogo
              logoType={FSAILogoType.ROW}
              className={'login-col-logo w-full'}
            />
            <PartnerLogo className={'my-5 flex w-full justify-center'} />
            <h1 className="txt_semibold_sm text-center">
              Choose a new password
            </h1>
            <p className="text-md mt-5 text-center">
              Password must be 8+ characters, case-sensitive, with uppercase,
              lowercase, number, special characters, or spaces allowed.
            </p>
            <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-6">
              <div className="relative">
                <PrimaryInput
                  type={showPassword ? 'text' : 'password'}
                  placeholder="New Password"
                  value={formData.password}
                  callback={(value) => {
                    setFormData((prev) => ({ ...prev, password: value }))
                    clearError('password')
                  }}
                  error={errors.password}
                  disabled={isSubmitting}
                />
                <div
                  className="absolute top-1/2 right-1 -translate-y-1 cursor-pointer opacity-70"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {!errors.password &&
                    formData.password.length > 0 &&
                    (showPassword ? (
                      <EyeClosed className="text-var(--fsai-foreground) p-px" />
                    ) : (
                      <Eye className="text-var(--fsai-foreground) p-px" />
                    ))}
                </div>
              </div>

              <div className="relative">
                <PrimaryInput
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  callback={(value) => {
                    setFormData((prev) => ({ ...prev, confirmPassword: value }))
                    clearError('confirmPassword')
                  }}
                  error={errors.confirmPassword}
                  disabled={isSubmitting}
                />
                <div
                  className="absolute top-1/2 right-1 -translate-y-1 cursor-pointer opacity-70"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {!errors.confirmPassword &&
                    formData.confirmPassword.length > 0 &&
                    (showConfirmPassword ? (
                      <EyeClosed className="text-var(--fsai-foreground) p-px" />
                    ) : (
                      <Eye className="text-var(--fsai-foreground) p-px" />
                    ))}
                </div>
              </div>

              <div className="space-y-3 self-center!">
                <div className="flex items-center gap-2">
                  <PrimaryBtn
                    text={isSubmitting ? 'Submitting...' : 'Continue'}
                    type="submit"
                    disabled={
                      !!(
                        isSubmitting ||
                        formData.password.length === 0 ||
                        formData.confirmPassword.length === 0 ||
                        Boolean(errors.password) ||
                        Boolean(errors.confirmPassword)
                      )
                    }
                    className="text-center!"
                  />
                </div>
              </div>
            </form>
          </main>
        </div>
      </aside>
    </main>
  ) : (
    <div className="flex h-screen w-screen items-center justify-center">
      <Image
        src={Logo}
        alt="icon"
        width={100}
        height={100}
        style={{ width: '100%', height: 'auto' }}
        className="max-w-[150px] animate-pulse"
      />
    </div>
  )
}
