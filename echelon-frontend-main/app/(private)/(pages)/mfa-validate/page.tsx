'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { redirect, useRouter } from 'next/navigation'

import Logo from '@assets/FSAI_Logo_Row.svg'
import PrimaryBtn from '@components/buttons/primary-btn'
import SecondaryBtn from '@components/buttons/secondary-btn'
import PrimaryInput from '@components/inputs/primary-input'
import {
  challengeVerifyMFA,
  enrollMFA,
  removeUnverifiedFactors,
  signOut,
  verifyChallenge,
  verifyMFA,
  checkAuthenticatorAssuranceLevel,
  listMFAEnrolled,
} from '@services/auth-service'
import { getUserFromCookies } from '@services/user-service'
import { getCookie, setCookie } from '@services/cookie-service'
import { extractTokenInfo } from '@services/jwt-service'
import { deleteAllCookies } from '@services/cookie-service'
import { getClientInfo } from '@utils/get-client-info'
import PartnerLogo from '@assets/icons/partner-logo'


export default function MFAValidate() {
  const router = useRouter()
  const [qr_code, setQRCode] = useState('') // holds the QR code image SVG
  const [qr_code_uri, setQRCodeUri] = useState('') // holds the QR code image SVG
  const [verifyCode, setVerifyCode] = useState('') // contains the code entered by the user
  const [error, setError] = useState('') // holds an error message
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [factorId, setFactorId] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isMFANotEnrolled, setIsMFANotEnrolled] = useState(false)

  useEffect(() => {
    onLoad()
  }, [])

  const onLoad = async () => {
    const token = await getCookie('token')
    if (!token) {
      await deleteAllCookies()
      redirect('/login')
    }

    const user = await extractTokenInfo(token || '')
    const isSSOUser =
      user?.aal === 'aal1' && user?.amr[0]?.method === 'sso/saml'
    const response = await checkAuthenticatorAssuranceLevel()
    const currentLevel = response?.data?.currentLevel
    const nextLevel = response?.data?.nextLevel

    const isEnrolled = nextLevel === 'aal2' && currentLevel !== nextLevel

    setIsMFANotEnrolled(isEnrolled)

    if (isSSOUser || (nextLevel === 'aal2' && currentLevel === nextLevel)) {
      redirect('/choose-team')
    }

    if (!isEnrolled) {
      const response = await getUserFromCookies()
      const userMail = response?.email

      await removeUnverifiedFactors()
      const enrollResponse = await enrollMFA(userMail || '')

      if (enrollResponse?.data?.totp?.qr_code) {
        setQRCode(enrollResponse.data.totp.qr_code)
        setQRCodeUri(enrollResponse.data.totp.uri)
        setFactorId(enrollResponse.data.id)
      }
    }

    setIsLoading(false)
  }

  const onSubmitFirstTime = async () => {
    setIsSubmitting(true)
    const { data: challengeData } = await verifyChallenge(factorId)

    const { data: verifyData } = await verifyMFA({
      factorId: factorId,
      challengeId: challengeData.id,
      verifyCode: verifyCode,
    })

    if (verifyData.error) {
      setError('Incorrect code. Please try again.')
      setIsSubmitting(false)
      return
    }

    await setCookie('token', verifyData.access_token)
    await setCookie('refreshToken', verifyData.refresh_token)

    router.push('/choose-team')
  }

  const onSubmitOneTimeCode = async () => {
    setIsSubmitting(true)

    const { data: listMFAEnrolledData } = await listMFAEnrolled()

    const factor_id = listMFAEnrolledData.totp[0].id
    const { ip } = await getClientInfo()
    const { data } = await challengeVerifyMFA(verifyCode, factor_id, ip || '')

    if (data.error) {
      setError('Incorrect code. Please try again.')
      setIsSubmitting(false)
      return
    }

    await setCookie('token', data.access_token)
    await setCookie('refreshToken', data.refresh_token)

    router.push('/choose-team')
  }

  const handleGoBack = async () => {
    setIsSubmitting(true)
    // Try the server action but don't wait for it
    signOut().catch(() => {
      // Silently ignore server action errors
      console.log(
        'Server logout action failed, but client-side logout will proceed',
      )
    })

    // Manually clear cookies on the client side first
    document.cookie.split(';').forEach((cookie) => {
      const [name] = cookie.split('=')
      if (
        name.trim() !== 'browserName' &&
        name.trim() !== 'browserVersion' &&
        name.trim() !== 'deviceType'
      ) {
        document.cookie = `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
      }
    })

    setIsSubmitting(false)
    // Don't wait for server response, immediately redirect
    window.location.href = '/login'
  }

  // Input behavior management ----------------------

  // Clear the error when changing the input value
  useEffect(() => {
    if (verifyCode.length < 6) {
      setError('')
    }
  }, [verifyCode])

  // Validation of the submit button disabled
  const isDisabled = useMemo(
    () => verifyCode.length < 6 || isSubmitting || !verifyCode || !!error,
    [verifyCode, isSubmitting, error],
  )

  // Use effect for the form submit with the Enter key
  useEffect(() => {
    const handleEnterKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (isDisabled) return
        if (!isMFANotEnrolled) {
          onSubmitFirstTime()
        } else {
          onSubmitOneTimeCode()
        }
      }
    }

    document.addEventListener('keydown', handleEnterKey)
    return () => document.removeEventListener('keydown', handleEnterKey)
  }, [isDisabled])

  // ----------------------------------------------------------------

  return (
    <>
      {!isLoading ? (
        <form className="flex flex-col gap-8">
          <div className="flex max-w-screen min-w-screen flex-col items-center justify-start pt-[8vh]">
            <div className="shadow-primary flex h-fit w-fit flex-col justify-evenly bg-white p-[40px]">
              <div className="mfa_fsai_logo mb-[16px] flex h-[28px] w-full">
                <Image src={Logo} alt="MFA FSAI logo" width={116} height={28} />
              </div>
              <div className="mfa_partner_logo mt-[16px] mb-[16px] flex h-[38px] w-full items-center justify-center">
               <PartnerLogo width={120}/>
              </div>

              <p className="mfa_title mt-[16px] mb-[12px] text-center text-base font-semibold not-italic">
                Verify Your Account
              </p>

              <p className="mfa_subtitle mt-[12px] mb-[10px] text-center text-sm font-normal not-italic">
                {!isMFANotEnrolled
                  ? 'Use Authenticator to scan the QR code below'
                  : 'Enter code sent to Authenticator app'}
              </p>

              {!isMFANotEnrolled && qr_code && (
                <div className="mfa_qrcode mt-[10px] mb-[26px] flex h-[164px] w-full items-center justify-center">
                  <img
                    src={qr_code}
                    alt={qr_code_uri}
                    className="h-[164px] w-[164px]"
                  />
                </div>
              )}

              <div className="mfa_client_logo mt-[26px] mb-[12px] w-full">
                <PrimaryInput
                  placeholder="One-Time Code"
                  type="text"
                  inputMode="numeric"
                  value={verifyCode}
                  callback={setVerifyCode}
                  onClear={() => {
                    setError('')
                    setVerifyCode('')
                  }}
                  error={error}
                  disabled={isSubmitting}
                  maxLength={6}
                  focus={true}
                />
              </div>

              <div className="mt-[26px] w-full place-items-center">
                <div
                  className="w-fit"
                  onClick={() =>
                    !isMFANotEnrolled
                      ? onSubmitFirstTime()
                      : onSubmitOneTimeCode()
                  }
                >
                  <PrimaryBtn
                    text={isSubmitting ? 'verifying...' : 'Continue'}
                    disabled={isDisabled}
                    className="text-center!"
                  />
                </div>
              </div>
              <div
                className="mt-3 w-full place-items-center"
                onClick={() => handleGoBack()}
              >
                <SecondaryBtn
                  text="Go back"
                  disabled={isSubmitting}
                  className="text-center!"
                />
              </div>
            </div>
          </div>
        </form>
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
      )}
    </>
  )
}