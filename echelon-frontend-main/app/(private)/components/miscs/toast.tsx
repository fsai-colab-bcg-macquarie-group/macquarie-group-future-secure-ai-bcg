'use client'

import { useToast } from '@/app/(private)/contexts/context-toast'
import { X } from 'lucide-react'
import { useEffect } from 'react'
import PrimaryBtn from '../buttons/primary-btn'

export default function ToastOverlay() {
  const { toastState, toastActions } = useToast()
  const { isVisible, message } = toastState

  // need to ensure message is always an object with title and description
  const formattedMessage =
    typeof message === 'string' ? { title: message, description: '' } : message

  useEffect(() => {
    if (isVisible) {
      localStorage.setItem('toast', JSON.stringify({ isVisible, message }))
    } else {
      localStorage.removeItem('toast')
    }
  }, [isVisible, message])

  useEffect(() => {
    const savedToast = localStorage.getItem('toast')
    if (savedToast) {
      const { message } = JSON.parse(savedToast)
      toastActions.showToast({
        title: 'Note',
        description: message,
      })
    }
  }, [])

  const callbacksAndWatchers = {
    hideToast: toastActions.hideToast,
    message: formattedMessage,
  }

  if (!isVisible) return null

  return (
    <div className="fixed top-0 left-0 z-[9000] flex min-h-screen min-w-screen place-items-center items-center justify-center border bg-light700">
      <ConfirmModal {...callbacksAndWatchers} />
    </div>
  )
}

function ConfirmModal({
  message,
  hideToast,
}: {
  message: { title: string; description: string }
  hideToast: () => void
}) {
  return (
    <div className="anim_reveal_to_bottom relative z-30 w-[580px] bg-white p-6 pt-8">
      <button
        className="absolute top-3 right-3"
        type="button"
        onClick={() => {
          hideToast()
          localStorage.removeItem('toast')
        }}
      >
        <X className="stroke-1 text-fsai_Foreground" size={28} />
      </button>
      <section>
        <h4 className="my-2 text-xl font-[600]">{message.title}</h4>
        <p className="mb-20 text-[16px]">{message.description}</p>
      </section>
      <section className="flex gap-4">
        <div
          onClick={() => {
            hideToast()
            localStorage.removeItem('toast')
          }}
        >
          <PrimaryBtn text={'Done'} />
        </div>
      </section>
    </div>
  )
}
