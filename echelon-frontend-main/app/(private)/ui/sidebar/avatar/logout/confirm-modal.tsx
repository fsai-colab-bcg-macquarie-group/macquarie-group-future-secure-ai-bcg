'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'

import PrimaryBtn from '@components/buttons/primary-btn'
import SecondaryBtn from '@components/buttons/secondary-btn'

import { signOut } from '@services/auth-service'
import { deleteAllCookies } from '@services/cookie-service'
// ----------------------------------------------------------

export default function LogoutConfirmOverlay({
  setIsSelected,
}: {
  setIsSelected: (isSelected: boolean) => void
}) {
  return (
    <div className="bg-light700 fixed top-0 left-0 z-[9000] flex min-h-screen min-w-screen place-items-center items-center justify-center border">
      <ConfirmModal setIsSelected={setIsSelected} />
    </div>
  )
}

function ConfirmModal({
  setIsSelected,
}: {
  setIsSelected: (isSelected: boolean) => void
}) {
  const [LogOuting, setLogOuting] = useState(false)
  const router = useRouter()
  
  const handleLogout = async () => {
    if (LogOuting) return

    const iframes = document.getElementsByName(
      'fsai-apps',
    ) as NodeListOf<HTMLIFrameElement>
    if (iframes.length) {
      const iframe = iframes[0]
      if (iframe.contentWindow)
        iframe.contentWindow.postMessage({ command: 'logout' }, iframe.src)
    }

    setLogOuting(true)
    const response = await signOut()

    if (response && response.success) {
      await deleteAllCookies()
      router.push('/login')
    } else {
      await deleteAllCookies()
      router.push('/login')
    }
  }

  return (
    <div className="shadow-primary anim_reveal_to_bottom relative z-30 w-[580px] bg-white p-6 pt-8">
      <button
        className="absolute top-3 right-3"
        type="button"
        onClick={() => {
          if (LogOuting) return
          setIsSelected(false)
        }}
      >
        <X className="text-fsai_Foreground stroke-1" size={28} />
      </button>
      <section>
        <h4 className="my-2 text-xl font-[600]">Logout</h4>
        <p className="mb-20 text-[16px]">Are you sure you want to log out?</p>
      </section>
      <section className="flex gap-4">
        <div onClick={() => setIsSelected(false)}>
          <SecondaryBtn text="Cancel" disabled={LogOuting} />
        </div>
        <div onClick={handleLogout}>
          <PrimaryBtn
            text={LogOuting ? 'Logging out...' : 'Confirm'}
            disabled={LogOuting}
          />
        </div>
      </section>
    </div>
  )
}
