'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useCallback } from 'react'

import { useNavigationContext } from '@contexts/context-navigation'
import { useDataContext } from '@contexts/context-user-data'

import { getCookie } from '@services/cookie-service'

export enum IFrameCommands {
  REQUEST_ACCESS_TOKEN = 'requestAccessToken',
  REQUEST_REFRESH_TOKEN = 'requestRefreshToken',
  EXECUTE_ECHELON_REFRESH_PAGE = 'executeEchelonRefreshPage',
  UPDATE_TEAM_ID = 'updateTeamId',
  SET_SESSION = 'setSession',
  LOGOUT = 'logout',
}

export interface IFrameMessageProps {
  sessionData: {
    accessToken?: string
    refreshToken?: string
    selectedTeamId?: string
  }
  command: IFrameCommands
}

export default function IFrame() {
  const { appWatchers, usersWatchers } = useNavigationContext()
  const { userContextWatchers } = useDataContext()
  const router = useRouter()
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const prevUrlRef = useRef<string | null>(null)
  const userPageNotOpen = !usersWatchers.cUsersIsOpen

  const sendLogoutMessage = useCallback((targetUrl: string) => {
    const iframe = iframeRef.current
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage(
        {
          command: IFrameCommands.LOGOUT,
        } as IFrameMessageProps,
        targetUrl,
      )
    }
  }, [])

  const handleMessage = useCallback(
    async (event: MessageEvent<IFrameMessageProps>) => {
      // Remove trailing slash from URL for comparison
      const normalizedOrigin = event.origin.replace(/\/$/, '')
      const normalizedContextUrl = appWatchers.cIframeContent.url?.replace(/\/$/, '')

      if (normalizedOrigin !== normalizedContextUrl) {
        console.log('[Iframe] ORIGIN', event.origin)
        console.log('[Iframe] CONTEXT APP URL', appWatchers.cIframeContent.url)
        console.log('[Iframe] Message received from unknown origin', event)
        return
      }

      const message = event.data
      const token = await getCookie('token')
      const refreshToken = await getCookie('refreshToken')
      const selectedTeamId = await getCookie('selected_team_id')

      console.log('[Iframe] Message received', message)

      if (
        message.command === IFrameCommands.REQUEST_ACCESS_TOKEN &&
        token &&
        appWatchers.cIframeContent.url
      ) {
        const iframe = iframeRef.current
        if (iframe?.contentWindow) {
          iframe.contentWindow.postMessage(
            {
              command: IFrameCommands.SET_SESSION,
              sessionData: {
                accessToken: token,
                refreshToken: refreshToken,
                selectedTeamId: selectedTeamId,
              },
            } as IFrameMessageProps,
            appWatchers.cIframeContent.url,
          )
        }
      }

      if (message.command === IFrameCommands.EXECUTE_ECHELON_REFRESH_PAGE) {
        // await validateTokenForIframe()
        console.log('[Iframe] Executing echelon refresh page')
        window.location.reload()
      }
    },
    [appWatchers.cIframeContent.url],
  )

  useEffect(() => {
    window.addEventListener('message', handleMessage)

    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [handleMessage])

  const getTokens = async () => {
    const accessToken = await getCookie('token')
    const refreshToken = await getCookie('refreshToken')
    return { accessToken, refreshToken }
  }

  const handlePostMessageUpdateTeamId = async () => {
    const tokens = await getTokens()

    if (userContextWatchers.cSelectedTeam) {
      const iframe = iframeRef.current
      if (iframe?.contentWindow && appWatchers.cIframeContent.url) {
        iframe.contentWindow.postMessage(
          {
            command: IFrameCommands.UPDATE_TEAM_ID,
            sessionData: {
              selectedTeamId:
                userContextWatchers.cSelectedTeam.use_case_team_id,
              accessToken: tokens.accessToken,
              refreshToken: tokens.refreshToken,
            },
          } as IFrameMessageProps,
          appWatchers.cIframeContent.url,
        )
      }
    }
  }

  useEffect(() => {
    handlePostMessageUpdateTeamId()
  }, [userContextWatchers?.cSelectedTeam, appWatchers.cIframeContent.url])

  // Log out for the Iframes
  const beforeUnloadHandle = useCallback(() => {
    const iframe = iframeRef.current
    if (iframe?.contentWindow && appWatchers.cIframeContent.url) {
      sendLogoutMessage(appWatchers.cIframeContent.url)
    }
  }, [appWatchers.cIframeContent.url])

  useEffect(() => {
    window.addEventListener('beforeunload', beforeUnloadHandle)
  }, [beforeUnloadHandle, appWatchers.cIframeContent?.url])

  useEffect(() => {
    const currentUrl = appWatchers.cIframeContent?.url
    const prevUrl = prevUrlRef.current

    if (prevUrl && currentUrl && prevUrl !== currentUrl) {
      const iframe = iframeRef.current
      if (iframe?.contentWindow) {
        sendLogoutMessage(prevUrl)
      }
    }

    prevUrlRef.current = currentUrl || null
  }, [appWatchers.cIframeContent?.url])

  if (!appWatchers.cIframeContent || !appWatchers.cIframeContent.url) {
    return null
  }

  return (
    <>
      {userPageNotOpen && (
        <div className="flex h-full max-h-full w-full p-6">
          <iframe
            name="fsai-apps"
            allow={appWatchers.cIframeContent.allow ?? undefined}
            ref={iframeRef}
            src={appWatchers.cIframeContent.url}
            className="shadow-primary h-full w-full rounded-none"
          />
        </div>
      )}
    </>
  )
}
