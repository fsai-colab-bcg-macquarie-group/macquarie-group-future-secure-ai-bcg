'use client'

import { signOut } from '@/app/(private)/services/auth-service'
import { getCookie } from '@/app/(private)/services/cookie-service'
import { forceRefreshAccessToken } from '@/app/(private)/services/jwt-service'
import PrimaryBtn from '@components/buttons/primary-btn'
import SecondaryBtn from '@components/buttons/secondary-btn'
import { X } from 'lucide-react'
import { useEffect } from 'react'

export default function IframeConfirmOverlay({
  action,
}: {
  action: {
    confirmChangeApp: () => void
    cancelChangeApp: () => void
  }
}) {
  useEffect(() => {
    const checkToken = async () => {
      const token = await getCookie('token')
      const refreshToken = await getCookie('refreshToken')

      await forceRefreshAccessToken()

      if (!token || !refreshToken) {
        signOut()
        return (window.location.href = '/login')
      }
    }
    checkToken()
  }, [])

  return (
    <div className="fixed top-0 left-0 z-40 flex min-h-screen min-w-screen place-items-center items-center justify-center border bg-light700">
      <FeedbackModal action={action} />
    </div>
  )
}

function FeedbackModal({
  action,
}: {
  action: {
    confirmChangeApp: () => void
    cancelChangeApp: () => void
  }
}) {
  return (
    <div className="anim_reveal_to_bottom relative z-40 w-[580px] bg-white p-6 pt-8">
      <button
        className="absolute top-3 right-3"
        type="button"
        onClick={() => action.cancelChangeApp()}
      >
        <X className="stroke-1 text-fsai_Foreground" size={28} />
      </button>
      <section>
        <h4 className="my-2 mb-9 text-xl font-[600]">Switching Applications</h4>
        <p className="mb-2 text-[16px]">
          Are you sure you want to switch applications?
          <br />
          All unsaved data will be lost.
        </p>
        <p className="mb-10 text-[15px] font-[600]">
          This action cannot be undone.
        </p>
      </section>
      <section className="flex gap-4">
        <div
          onClick={() => {
            action.cancelChangeApp()
          }}
        >
          <SecondaryBtn text="Cancel" />
        </div>
        <div
          onClick={() => {
            action.confirmChangeApp()
          }}
        >
          <PrimaryBtn text="Confirm" />
        </div>
      </section>
    </div>
  )
}
