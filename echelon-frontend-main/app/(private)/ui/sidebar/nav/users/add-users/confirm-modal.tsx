'use client'

import PrimaryBtn from '@/app/(private)/components/buttons/primary-btn'
import SecondaryBtn from '@/app/(private)/components/buttons/secondary-btn'
import { useNavigationContext } from '@/app/(private)/contexts/context-navigation'
import { X } from 'lucide-react'

export default function AddUsersConfirmOverlay({
  setOnSuccess,
  email,
  clearFormData,
}: {
  setOnSuccess: (onSuccess: boolean) => void
  email: string
  clearFormData: () => void
}) {
  return (
    <div className="fixed top-0 left-0 z-[9000] flex min-h-screen min-w-screen place-items-center items-center justify-center border bg-light700">
      <FeedbackModal
        setOnSuccess={setOnSuccess}
        email={email}
        clearFormData={clearFormData}
      />
    </div>
  )
}

function FeedbackModal({
  setOnSuccess,
  email,
  clearFormData,
}: {
  setOnSuccess: (onSuccess: boolean) => void
  email: string
  clearFormData: () => void
}) {
  const { contextUsersActions } = useNavigationContext()

  return (
    <div className="shadow-primary anim_reveal_to_bottom relative w-[580px] bg-white p-6 pt-8">
      <button
        className="absolute top-3 right-3"
        type="button"
        onClick={() => {
          clearFormData()
          contextUsersActions.cToggleAddingUsers()
          contextUsersActions.cToggleUsersOption()
        }}
      >
        <X className="stroke-1 text-fsai_Foreground" size={28} />
      </button>
      <section>
        <h4 className="my-2 text-xl font-[600]">Account Created</h4>
        <p className="mb-2 text-[16px]">
          The user has been added they will now be sent an invite to the
          following email
        </p>
        <p className="mb-20 text-[16px] font-[600]">{email}</p>
      </section>
      <section className="flex gap-4">
        <div
          onClick={() => {
            clearFormData()
            setOnSuccess(false)
          }}
        >
          <SecondaryBtn text="Add Another User" />
        </div>
        <div
          onClick={() => {
            contextUsersActions.cToggleAddingUsers()
            contextUsersActions.cToggleUsersOption()
            clearFormData()
          }}
        >
          <PrimaryBtn text="Done" />
        </div>
      </section>
    </div>
  )
}
