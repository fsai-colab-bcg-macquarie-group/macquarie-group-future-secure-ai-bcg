'use client'

import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { User } from '@definitions/user-definitions'
import { resendActivationEmail } from '@services/user-query-service'
import { useToast } from '@contexts/context-toast'

export default function FeedbackOverlay({
  email,
  callback,
  userId,
}: {
  email: User['email']
  callback: () => void
  userId: User['id']
}) {
  const [activationState, setActivationState] = useState<
    'success' | 'error' | 'loading'
  >('loading')

  const resendActivation = async () => {
    const response = await resendActivationEmail(userId)
    if (response.statusCode === 200) {
      setActivationState('success')
    } else {
      setActivationState('error')
    }
  }

  useEffect(() => {
    resendActivation()
  }, [])

  if (activationState === 'loading') {
    return (
      <div className="fixed top-0 left-0 z-[9000] flex min-h-screen min-w-screen place-items-center items-center justify-center border bg-light700">
        <FeedbackModal
          props={{
            tittle: 'Sending Activation Email',
            description: 'Waiting for the email to be sent...',
            activationState: activationState,
          }}
        />
      </div>
    )
  }

  if (activationState === 'success') {
    return (
      <div className="fixed top-0 left-0 z-[9000] flex min-h-screen min-w-screen place-items-center items-center justify-center border bg-light700">
        <FeedbackModal props={{ email, callback }} />
      </div>
    )
  }

  const { toastActions } = useToast()
  if (activationState === 'error') {
    toastActions.showToast({
      title: 'Error',
      description: 'Failed to send activation email',
    })
  }
}

function FeedbackModal({
  props,
}: {
  props: {
    email?: User['email']
    callback?: () => void
    tittle?: string
    description?: string
    activationState?: 'success' | 'error' | 'loading'
  }
}) {
  return (
    <div className="anim_reveal_to_bottom relative w-[580px] bg-white p-6 pt-8">
      <button
        className="absolute top-3 right-3"
        type="button"
        onClick={props?.callback}
      >
        {props.activationState !== 'loading' && (<X className="stroke-1 text-fsai_Foreground" size={28} />)}
      </button>
      <section>
        <h4 className="my-2 text-xl font-[600]">
          {props.tittle || 'Activation Sent'}
        </h4>
        <p className="mb-2 text-[16px]">
          {props.description ||
            'The user has been sent an activation email to the following address'}
        </p>
        <p className="mb-4 text-[16px] font-[600]">{props?.email}</p>
      </section>
    </div>
  )
}
