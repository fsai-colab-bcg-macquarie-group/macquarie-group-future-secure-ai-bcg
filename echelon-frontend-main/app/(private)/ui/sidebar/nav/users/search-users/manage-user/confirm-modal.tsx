'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

import { useToast } from '@contexts/context-toast'
import { User } from '@definitions/user-definitions'
import { activateUser, deactivateUser } from '@services/user-query-service'
import PrimaryBtn from '@components/buttons/primary-btn'
import SecondaryBtn from '@components/buttons/secondary-btn'

interface OverlayProps {
  model: 'activate' | 'deactivate'
  callback: {
    setFluxToEdit: () => void
    rebuildForm: () => void
  }
  userId: User['id']
}

export default function ConfirmOverlay({
  model,
  callback,
  userId,
}: OverlayProps) {
  return (
    <div className="fixed top-0 left-0 z-[9000] flex min-h-screen min-w-screen place-items-center items-center justify-center border bg-light700">
      <FeedbackModal model={model} callback={callback} userId={userId} />
    </div>
  )
}

function FeedbackModal({
  model,
  callback,
  userId,
}: {
  model: 'activate' | 'deactivate'
  callback: {
    setFluxToEdit: () => void
    rebuildForm: () => void
  }
  userId: User['id']
}) {
  // =========== Submission state ================================================
  const [activationState, setActivationState] = useState<
    'success' | 'error' | 'loading' | 'idle'
  >('idle')

  const { toastActions } = useToast()
  // ======================================================================================

  // =========== Handle functions ====================================================

  // Activate user
  const handleActivation = async () => {
    setActivationState('loading')
    const response = await activateUser(userId)
    if (response.statusCode === 200) {
      setActivationState('success')
      callback.setFluxToEdit()
      callback.rebuildForm()
      toastActions.showToast({
        title: 'User activated successfully',
        description: 'The user has been activated successfully',
      })
    } else {
      setActivationState('error')
      callback.setFluxToEdit()
      toastActions.showToast({
        title: 'Error activating user',
        description: 'The user has not been activated',
      })
    }
  }
  // Deactivate user
  const handleDeactivation = async () => {
    setActivationState('loading')
    const response = await deactivateUser(userId)

    if (response.statusCode === 200) {
      setActivationState('success')
      callback.setFluxToEdit()
      callback.rebuildForm()
      toastActions.showToast({
        title: 'User deactivated successfully',
        description: 'The user has been deactivated successfully',
      })
    } else {
      setActivationState('error')
      callback.setFluxToEdit()
      toastActions.showToast({
        title: 'Error deactivating user',
        description: 'The user has not been deactivated',
      })
    }
  }
  // ======================================================================================

  return (
    <div className="shadow-primary anim_reveal_to_bottom relative w-[580px] bg-white p-6 pt-8">
      <button
        className="absolute top-3 right-3"
        type="button"
        onClick={() => {
          if (model === 'activate') return callback.setFluxToEdit()
        }}
        disabled={activationState === 'loading'}
      >
        <X className="stroke-1 text-fsai_Foreground" size={28} />
      </button>
      <section>
        <h4 className="my-2 text-xl font-[600]">
          {model === 'activate' ? 'Activate User' : 'Deactivate User'}
        </h4>
        <p className="mb-2 text-[16px]">
          {model === 'activate'
            ? 'Are you sure you want to activate the user?'
            : 'Are you sure you want to deactivate the user?'}
        </p>
      </section>
      <section className="mt-12 flex gap-4">
        <div
          onClick={() => {
            if (activationState === 'loading') return
            if (model === 'activate') {
              callback.rebuildForm()
            } else {
              callback.rebuildForm()
            }
          }}
        >
          <SecondaryBtn
            text="Cancel"
            disabled={activationState === 'loading'}
          />
        </div>
        <div
          onClick={async () => {
            if (activationState === 'loading') return
            if (model === 'activate') {
              await handleActivation()
            } else {
              await handleDeactivation()
            }
          }}
        >
          <PrimaryBtn text="Confirm" disabled={activationState === 'loading'} />
        </div>
      </section>
    </div>
  )
}
