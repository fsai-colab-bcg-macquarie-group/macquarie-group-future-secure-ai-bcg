'use client'

import SsoButton from './sso-button'
import Errors from './errors'
import { useEffect, useState } from 'react'

export default function SsoLoginArea(loginStates: {
  isSubmitting: boolean
  handleSubmit: (bool: boolean) => Promise<void>
  hasSsoLoginMethod: boolean
}) {
  const [showOR, setShowOR] = useState(false)

  useEffect(() => {
    if (loginStates.hasSsoLoginMethod) {
      setShowOR(true)
    }
  }, [])

  return (
    <>
      {showOR && (
        <div className="mt-6 block">
          <>
            <div className="mb-7 flex items-center gap-3 p-2">
              <div className="h-px w-full bg-gray700 opacity-40" />
              <p className="text-center text-[12px] font-normal text-gray700">
                OR
              </p>
              <div className="h-px w-full bg-gray700 opacity-40" />
            </div>
          </>
          <SsoButton
            isSubmitting={loginStates.isSubmitting}
            handleSubmit={loginStates.handleSubmit}
          />
          <Errors />
        </div>
      )}
    </>
  )
}
