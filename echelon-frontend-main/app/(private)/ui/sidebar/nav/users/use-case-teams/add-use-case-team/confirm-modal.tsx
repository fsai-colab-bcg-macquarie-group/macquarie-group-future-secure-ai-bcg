'use client'

import PrimaryBtn from '@components/buttons/primary-btn'
import { X } from 'lucide-react'

export default function AddTeamConfirmOverlay({
  //   setOnSuccess,
  email,
  finish,
}: {
  //   setOnSuccess: (onSuccess: boolean) => void
  email: string
  finish: () => void
}) {
  return (
    <div className="fixed top-0 left-0 z-[9000] flex min-h-screen min-w-screen place-items-center items-center justify-center border bg-light700">
      <FeedbackModal
        // setOnSuccess={setOnSuccess}
        email={email}
        finish={finish}
      />
    </div>
  )
}

function FeedbackModal({
  //   setOnSuccess,
  email,
  finish,
}: {
  //   setOnSuccess: (onSuccess: boolean) => void
  email: string
  finish: () => void
}) {
  return (
    <div className="shadow-primary anim_reveal_to_bottom relative w-[580px] bg-white p-6 pt-8">
      <button
        className="absolute top-3 right-3"
        type="button"
        onClick={() => {
          finish()
        }}
      >
        <X className="stroke-1 text-fsai_Foreground" size={28} />
      </button>
      <section>
        <h4 className="my-2 text-xl font-[600]">Use Case Team Created</h4>
        <div className="mt-6 mb-20 flex w-full flex-wrap gap-[2px] text-[16px]">
          <p>The</p>
          <span className="text-[16px] font-[600]">{email}</span>
          <p>use case team has been added</p>
        </div>
      </section>
      <section className="flex gap-4">
        {/* <div
          onClick={() => {
            finish()
            setOnSuccess(false)
          }}
        >
          <SecondaryBtn text="Add Another Use Case Team" />
        </div> */}
        <div
          onClick={() => {
            finish()
          }}
        >
          <PrimaryBtn text="Done" />
        </div>
      </section>
    </div>
  )
}
