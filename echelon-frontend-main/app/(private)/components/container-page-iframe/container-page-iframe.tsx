'use client'

import { useEffect } from 'react'
import IFrame from '@ui/iframe/iframe'
import { useNavigationContext } from '../../contexts/context-navigation'
import { usePathname, useRouter } from 'next/navigation'
import { validIframeNames } from '@/middleware'
import { getIframeAllow, getIframeUrl } from '../../ui/sidebar/nav/actions'

export default function PageIframe() {
  const { appWatchers, contextAppActions } = useNavigationContext()
  const router = useRouter()
  const pathname = usePathname()

  const iframeContent = appWatchers.cIframeContent

  const handleNavigateIframe = async () => {
    const slug = pathname.split('/').filter(Boolean).at(-1)

    if (!slug || !validIframeNames.includes(slug)) return

    if (iframeContent?.name !== slug) {
      const url = await getIframeUrl(slug)
      const allow = await getIframeAllow(slug)
      contextAppActions.cUpdateIframeContent(url, slug, allow)
    }
  }

  useEffect(() => {
    handleNavigateIframe()
  }, [pathname])

  const handleSetIframePathUrl = () => {
    const IframeCurrentName = iframeContent?.name
    if (!IframeCurrentName || !validIframeNames.includes(IframeCurrentName))
      return

    let cleanPath = pathname || '/'

    validIframeNames.forEach((slug) => {
      if (cleanPath.endsWith(`/${slug}`)) {
        cleanPath = cleanPath.replace(`/${slug}`, '')
      }
    })

    const finalPath = `${cleanPath}/${IframeCurrentName}`.replace(/\/+/g, '/')

    if (pathname !== finalPath) {
      router.replace(finalPath, { scroll: false })
    }
  }

  useEffect(() => {
    handleSetIframePathUrl()
  }, [iframeContent?.name])

  return <IFrame />
}
