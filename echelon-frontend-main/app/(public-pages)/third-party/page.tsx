'use client'

// Natives modules from Next and React
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { handleThirdParty } from './third-party-actions'
import { useToast } from '@contexts/context-toast'

export default function ThirdPartyPage() {
  const [hash, setHash] = useState('')
  const router = useRouter()
  const { toastActions } = useToast()

  useEffect(() => {
    const currentHash = window.location.hash
    setHash(currentHash)

    const onHashChange = () => {
      setHash(window.location.hash)
    }
    window.addEventListener('hashchange', onHashChange)

    processHash()

    return () => {
      window.removeEventListener('hashchange', onHashChange)
    }
  }, [hash])

  const processHash = async () => {
    if (!hash) return

    try {
      const section = hash.replace('#', '')
      const params = new URLSearchParams(section)

      const accessToken = params.get('access_token')
      const refreshToken = params.get('refresh_token')
      const type = params.get('type')

      if (!accessToken || !refreshToken) {
        console.error('Missing tokens in the hash')
        router.push('/login')
        toastActions.showToast({
          title: 'Access Denied',
          description: 'Email link is invalid or expired.',
        })
        return
      }

      await handleThirdParty({ accessToken, refreshToken, type })

      router.push('/')
    } catch (error) {
      console.error('Failed to process hash:', error)
    }
  }

  return (
    <main className="flex h-screen w-full items-center justify-center">
      <p className="text-center text-2xl">Redirecting...</p>
    </main>
  )
}
