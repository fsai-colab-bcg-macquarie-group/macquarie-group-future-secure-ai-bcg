'use client'

import { redirect } from 'next/navigation'
import PrimaryBtn from '@/app/(private)/components/buttons/primary-btn'
import { clearAllAuthCookies } from '../login/login-actions'

interface RecoverySentProps {
  email: string
}

export function RecoverySent({ email }: RecoverySentProps) {
  const handleCancelPasswordRecovery = async () => {
    await clearAllAuthCookies()
    redirect('/login')
  }

  return (
    <section className="mt-5 space-y-2 px-4 text-center">
      <p>We sent a recovery link to you at</p>

      <div className="justify-between sm:inline-flex">
        <div className="text-[20px]">{email}</div>
      </div>

      <p className="pt-5">
        If you haven&lsquo;t received the email, check your spam folder
      </p>

      <div className="flex flex-col items-center">
        <div className="mt-7" />
        <div onClick={handleCancelPasswordRecovery}>
          <PrimaryBtn text="Return to login" className="text-center!" />
        </div>
      </div>
    </section>
  )
}
