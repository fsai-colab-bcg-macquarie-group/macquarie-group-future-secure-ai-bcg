import PrimaryBtn from '@components/buttons/primary-btn'
import SecondaryBtn from '@components/buttons/secondary-btn'
import PrimaryInput from '@components/inputs/primary-input'
import { useToast } from '@contexts/context-toast'
import { useDataContext } from '@contexts/context-user-data'
import {
  passwordResetSchema,
  PasswordResetSchema,
} from '@definitions/auth-definitions'
import { signOut } from '@services/auth-service'
import { clearAllAuthCookies } from '@public/login/login-actions'
import { Eye, EyeClosed, X } from 'lucide-react'
import { redirect } from 'next/navigation'
import { useState } from 'react'
// import { resetSubordinatePassword } from '@services/user-query-service'
import resetUserPassword from '../../../../avatar/reset-password/actions'

export default function ResetPasswordOverlay({
  callback,
}: {
  callback: () => void
}) {
  return (
    <div className="fixed top-0 left-0 z-[9000] flex min-h-screen min-w-screen place-items-center items-center justify-center border bg-light700">
      <ResetPasswordForm callback={callback} />
    </div>
  )
}

function ResetPasswordForm({ callback }: { callback: () => void }) {
  const [password, setPassword] = useState(false)
  const [passwordConfirm, setPasswordConfirm] = useState(false)

  const [formData, setFormData] = useState<PasswordResetSchema>({
    password: '',
    confirmPassword: '',
  })

  const [errors, setErrors] = useState<{
    password?: string
    confirmPassword?: string
  }>({})

  const [isSubmitting, setIsSubmitting] = useState(false)

  const { userContextWatchers } = useDataContext()
  const { toastActions } = useToast()

  const clearError = (field: keyof PasswordResetSchema) => {
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
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
      setPassword(false)
      setPasswordConfirm(false)

      // Check if the user is available
      if (!userContextWatchers.cManagedUser) {
        toastActions.showToast({
          title: 'Account Error',
          description:
            'We are unable to load your account details at the moment',
        })
        setIsSubmitting(false)
        return
      }

      const resetResult = await resetUserPassword(
        formData,
        userContextWatchers.cManagedUser.email,
      )

      if (resetResult.success) {
        toastActions.showToast({
          title: 'Password Reset',
          description:
            'Password reset successfully, please login with your new password',
        })
        await clearAllAuthCookies()
        await signOut()
        redirect('/login')
      } else {
        toastActions.showToast({
          title: 'Password Reset Error',
          description: resetResult.message,
        })
        setIsSubmitting(false)
      }
    } catch (error: Error | unknown) {
      setIsSubmitting(false)
      console.error(error)
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="anim_reveal_to_bottom relative w-[580px] bg-white p-6 pt-8">
        <button
          className="absolute top-3 right-3"
          type="button"
          onClick={() => {
            if (isSubmitting) return
            callback()
          }}
        >
          <X className="stroke-1 text-fsai_Foreground" size={28} />
        </button>
        <section>
          <h4 className="my-2 text-xl font-[600]">Choose a new password</h4>
          <p className="max-w-[400px] text-[16px]">
            Password must be 8+ characters, case-sensitive, with uppercase,
            lowercase, number, special characters, or spaces allowed.
          </p>
        </section>
        <section className="flex flex-col gap-10 pt-8 pb-12">
          <div className="relative w-fit">
            <PrimaryInput
              placeholder="Password"
              type={password ? 'text' : 'password'}
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
              onClick={() => setPassword(!password)}
            >
              {!errors.password &&
                formData.password.length > 0 &&
                (password ? (
                  <EyeClosed className="p-px text-fsai_Foreground" />
                ) : (
                  <Eye className="p-px text-fsai_Foreground" />
                ))}
            </div>
          </div>

          <div className="relative w-fit">
            <PrimaryInput
              placeholder="Confirm Password"
              type={passwordConfirm ? 'text' : 'password'}
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
              onClick={() => setPasswordConfirm(!passwordConfirm)}
            >
              {formData.confirmPassword.length > 0 &&
                !errors.confirmPassword &&
                (passwordConfirm ? (
                  <EyeClosed className="p-px text-fsai_Foreground" />
                ) : (
                  <Eye className="p-px text-fsai_Foreground" />
                ))}
            </div>
          </div>
        </section>
        <section className="flex gap-4">
          <div onClick={() => callback()}>
            <SecondaryBtn text="Cancel" disabled={isSubmitting} />
          </div>
          <div>
            <PrimaryBtn
              text={isSubmitting ? 'Submitting...' : 'Continue'}
              type="submit"
              disabled={
                !!(
                  isSubmitting ||
                  formData.password.length < 4 ||
                  formData.confirmPassword.length < 4 ||
                  errors.password ||
                  errors.confirmPassword
                )
              }
            />
          </div>
        </section>
      </div>
    </form>
  )
}
