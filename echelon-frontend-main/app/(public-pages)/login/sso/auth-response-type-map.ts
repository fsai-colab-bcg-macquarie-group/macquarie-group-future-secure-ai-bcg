import { ErrorType } from '@/app/(private)/enum/error-active-type'
import { SuccessType } from '@/app/(private)/enum/success-active-type'

export const authResponseTypeMap: Record<ErrorType | SuccessType, string> = {
  [ErrorType.UserNotExists]:
    'Your account has not been registered yet. Please contact an admin to complete your registration.',
  [ErrorType.UserNotActive]: `Your account has not been Activeted yet. Check your email activation link or contact support admin at ${process.env.NEXT_PUBLIC_SUPPORT_EMAIL}`,
  [ErrorType.UserActiveLinkExpired]: `Your activation link has expired. Please contact support to request a new activation link at ${process.env.NEXT_PUBLIC_SUPPORT_EMAIL}`,
  [SuccessType.UserSSOActivated]:
    'Your Single Sign-On has been successfully activated!',
}
