'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useNavigationContext } from '@contexts/context-navigation'
import Users from './users/users'
import IframeConfirmOverlay from './confirm-modal'
import { getIframeUrl, getIframeAllow, enableFlowTell } from './actions'
import UsersIcon from '@assets/svg/users-sidebar.svg'
import N8nIcon from '@assets/svg/flow.svg' // fsai-flow is n8n
import AiFlowsIcon from '@assets/svg/gen.svg' // flow-gen is n8n,
import ObserverIcon from '@assets/svg/see.svg' // Observer is LangFuse
import FlowTellIcon from '@assets/svg/phone-sidebar.svg' // Flow-Tell is flow tell kkk
import { useDataContext } from '@contexts/context-user-data'
import NavigationSkeleton from './skeleton'
import { getUser } from '@/app/(private)/services/user-service'
import {
  deleteCookie,
  getCookie,
} from '@/app/(private)/services/cookie-service'

export enum UserAccess {
  Admin = 'Platform Administrator',
  Designer = 'AI Worker Designer',
  Manager = 'AI Worker Manager',
  Commercial = 'Commercial Administrator',
}

export default function Navigation() {
  const { contextUsersActions, usersWatchers, contextAppActions, appWatchers } =
    useNavigationContext()
  const [onChangeApp, setOnChangeApp] = useState(false)
  // flow-fsai - flow-gen - flow-see - flow-tell
  const [newApp, setNewApp] = useState<{
    url: string | null
    name: string | null
    allow?: string | null
  }>({
    url: null,
    name: null,
    allow: null,
  })

  // State used to disable all menu interactions while some change is waiting for a promise
  const [isLoading, setIsLoading] = useState(false)
  // New state to control the initial navigation loading
  const [isNavLoading, setIsNavLoading] = useState(true)
  const { userContextWatchers } = useDataContext()

  const [showFlowTell, setShowFlowTell] = useState(false)

  //Strategy to validate the user via axios forcing the token verification
  const validateUser = async () => {
    if (!userContextWatchers.cUserData?.sub) return
    const user = await getUser(userContextWatchers.cUserData.sub)
    if (user) return
  }

  // ==============================================================

  // Effects

  useEffect(() => {
    validateUser()
  }, [userContextWatchers.cUserData])

  // Effect to verify when the user data is ready
  useEffect(() => {
    if (userContextWatchers.cUserData) {
      // We add a small delay to ensure everything is rendered
      const timer = setTimeout(() => {
        setIsNavLoading(false)
      }, 1400)

      return () => clearTimeout(timer)
    }
  }, [userContextWatchers.cUserData])

  useEffect(() => {
    const checkAutoOpenApp = async () => {
      const autoOpenApp = await getCookie('auto_open_app')

      if (autoOpenApp === 'tell') {
        await handleFlowTell()
      }

      deleteCookie('auto_open_app')
    }

    const validateFlowTell = async () => {
      const result = await enableFlowTell()

      if (result) {
        setShowFlowTell(result)
      }
    }

    checkAutoOpenApp()
    validateFlowTell()
  }, [])

  // ==============================================================

  const handleChangeApp = {
    confirmChangeApp: async () => {
      await validateUser()

      if (newApp.name === 'users') {
        contextUsersActions.cToggleUsersOption()
        contextAppActions.cUpdateIframeContent('', '')
        setOnChangeApp(false)
        return
      }

      if (newApp.url && newApp.name) {
        contextAppActions.cUpdateIframeContent(
          newApp.url,
          newApp.name,
          newApp.allow,
        )
      }
      setOnChangeApp(false)
      setTimeout(() => {
        setIsLoading(false)
      }, 2000)
    },
    cancelChangeApp: () => {
      setOnChangeApp(false)
      setIsLoading(false)
    },
  }

  // It is a simple logic to control the visibility of the items in the navigation
  const userProfile = () => {
    return userContextWatchers.cUserData?.profile?.access_name
  }

  const handleFlowTell = async () => {
    await validateUser()
    if (appWatchers.cIframeContent.name === 'flow-tell') return
    if (isLoading) return
    setIsLoading(true)
    if (
      appWatchers.cIframeContent.url !== null &&
      appWatchers.cIframeContent.name !== 'flow-tell' &&
      appWatchers.cIframeContent.name !== ''
    ) {
      ; (async () => {
        const url = await getIframeUrl('flow-tell')
        setNewApp({
          url,
          name: 'flow-tell',
        })
        setOnChangeApp(true)
      })()
    } else {
      if (isLoading) return
      setIsLoading(true)
        ; (async () => {
          const url = await getIframeUrl('flow-tell')
          contextAppActions.cUpdateIframeContent(url, 'flow-tell')
          setIsLoading(false)
        })()
    }

    if (usersWatchers.cUsersIsOpen) {
      contextUsersActions.cToggleUsersOption()
    }
  }

  // If loading, show a loading indicator
  if (isNavLoading) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center opacity-60">
        <span>
          <NavigationSkeleton />
        </span>
      </div>
    )
  }

  const isNotManager = userProfile() !== UserAccess.Manager
  const isPlatformCommercialAdministrator =
    userProfile() === UserAccess.Admin ||
    userProfile() === UserAccess.Commercial
  const isAIWorkerDesigner = userProfile() === UserAccess.Designer

  return (
    <>
      {isNotManager && (
        <>
          <ul
            id="navigation-list"
            className={`flex flex-col gap-2 text-[10.5px]`}
          >
            {isPlatformCommercialAdministrator && (
              <>
                <li
                  key="users"
                  className={`${isLoading ? 'opacity-50' : 'hover:cursor-pointer'}`}
                >
                  <button
                    className="group mb-2 flex w-full flex-col items-center gap-px"
                    disabled={isLoading}
                    onMouseDown={async () => {
                      await validateUser()
                      if (usersWatchers.cUsersIsOpen) {
                        contextUsersActions.cToggleUsersOption()
                        contextAppActions.cUpdateIframeContent('', '')
                        return
                      }

                      if (appWatchers.cIframeContent.url) {
                        setNewApp({
                          url: '',
                          name: 'users',
                        })
                        setOnChangeApp(true)
                        return
                      }

                      contextUsersActions.cToggleUsersOption()
                      contextAppActions.cUpdateIframeContent('', '')
                    }}
                  >
                    <>
                      <div
                        className={`flex aspect-square w-full items-center justify-center rounded-4xl p-1.5 transition-all duration-300 group-hover:rounded-none ${!isLoading && 'group-hover:bg-gray000'} ${usersWatchers.cUsersIsOpen && 'bg-gray100 rounded-none'}`}
                      >
                        <Image
                          src={UsersIcon}
                          alt="icon"
                          width={100}
                          height={100}
                          style={{ width: '100%', height: 'auto' }}
                          onError={() => { }}
                        />
                      </div>
                      <p>Users</p>
                    </>
                  </button>
                  <div
                    className={`${usersWatchers.cUsersIsOpen ? 'users_open_to_right w-[171px]' : 'users_close_to_left w-0 overflow-hidden px-0'} absolute top-0 left-[calc(100%+1px)] z-10 h-screen`}
                  >
                    <Users />
                  </div>
                </li>
                {(document.querySelector('ul[id="navigation-list"]')?.children
                  ?.length ?? 0) >= 3 && (
                    <hr className="w-3/5 place-self-center border-neutral-200" />
                  )}
              </>
            )}

            {/* Separation for easier visualization */}
            {isAIWorkerDesigner && (
              <>
                {/* Separation for easier visualization */}
                {/* FSAI Flow */}
                <li
                  key="fsai-flow"
                  className={`${isLoading ? 'opacity-50' : 'hover:cursor-pointer'}`}
                >
                  <button
                    className="group relative mb-2 flex w-full flex-col items-center gap-px"
                    disabled={isLoading}
                    name="fsai-flow"
                    onMouseDown={async () => {
                      await validateUser()
                      if (appWatchers.cIframeContent.name === 'fsai-flow')
                        return

                      if (isLoading) return
                      setIsLoading(true)
                      if (
                        appWatchers.cIframeContent.url !== null &&
                        appWatchers.cIframeContent.name !== 'fsai-flow' &&
                        appWatchers.cIframeContent.name !== ''
                      ) {
                        ;(async () => {
                          const url = await getIframeUrl('fsai-flow')
                          setNewApp({
                            url,
                            name: 'fsai-flow',
                          })
                          setOnChangeApp(true)
                        })()
                      } else {
                        if (isLoading) return
                        setIsLoading(true)
                        ;(async () => {
                          const url = await getIframeUrl('fsai-flow')
                          contextAppActions.cUpdateIframeContent(
                            url,
                            'fsai-flow',
                          )
                          setIsLoading(false)
                        })()
                      }

                      if (usersWatchers.cUsersIsOpen) {
                        contextUsersActions.cToggleUsersOption()
                      }
                    }}
                  >
                    <>
                      <div
                        className={`flex aspect-square w-full items-center justify-center rounded-4xl p-2 transition-all duration-300 group-hover:rounded-none ${!isLoading && 'group-hover:bg-gray000'} ${appWatchers.cIframeContent.name === 'fsai-flow' && 'bg-gray100 rounded-none'}`}
                      >
                        <Image
                          src={N8nIcon}
                          alt="icon"
                          width={100}
                          height={100}
                          style={{ width: '95%', height: 'auto' }}
                          className="transition-opacity duration-300"
                        />
                      </div>
                      <p>FSAI Flow</p>
                    </>
                  </button>
                </li>
                {/* Separation for easier visualization */}
                {/* Flow Gen */}
                <li
                  key="flow-gen"
                  className={`${isLoading ? 'opacity-50' : 'hover:cursor-pointer'}`}
                >
                  <button
                    className="group relative mb-2 flex w-full flex-col items-center gap-px"
                    disabled={isLoading}
                    onMouseDown={async () => {
                      await validateUser()
                      if (appWatchers.cIframeContent.name === 'flow-gen') return
                      if (isLoading) return
                      setIsLoading(true)
                      if (
                        appWatchers.cIframeContent.url !== null &&
                        appWatchers.cIframeContent.name !== 'flow-gen' &&
                        appWatchers.cIframeContent.name !== ''
                      ) {
                        ;(async () => {
                          const url = await getIframeUrl('flow-gen')
                          const allow = await getIframeAllow('flow-gen')
                          setNewApp({
                            url,
                            name: 'flow-gen',
                            allow,
                          })
                          setOnChangeApp(true)
                        })()
                      } else {
                        if (isLoading) return
                        setIsLoading(true)
                        ;(async () => {
                          const url = await getIframeUrl('flow-gen')
                          const allow = await getIframeAllow('flow-gen')
                          contextAppActions.cUpdateIframeContent(
                            url,
                            'flow-gen',
                            allow,
                          )
                          setIsLoading(false)
                        })()
                      }

                      if (usersWatchers.cUsersIsOpen) {
                        contextUsersActions.cToggleUsersOption()
                      }
                    }}
                  >
                    <>
                      <div
                        className={`flex aspect-square w-full items-center justify-center rounded-4xl p-2 transition-all duration-300 group-hover:rounded-none ${!isLoading && 'group-hover:bg-gray000'} ${appWatchers.cIframeContent.name === 'flow-gen' && 'bg-gray100 rounded-none'}`}
                      >
                        <Image
                          src={AiFlowsIcon}
                          alt="icon"
                          width={100}
                          height={100}
                          style={{ width: '95%', height: 'auto' }}
                          className="transition-opacity duration-300"
                        />
                      </div>
                      <p>Flow-Gen</p>
                    </>
                  </button>
                </li>

                {/* Separation for easier visualization */}
                {/* Flow See */}
                <>
                  <li
                    key="flow-see"
                    className={`${isLoading ? 'opacity-50' : 'hover:cursor-pointer'}`}
                  >
                    <button
                      className="group relative mb-2 flex w-full flex-col items-center gap-px"
                      disabled={isLoading}
                      onMouseDown={async () => {
                        await validateUser()
                        if (appWatchers.cIframeContent.name === 'flow-see')
                          return
                        if (isLoading) return
                        setIsLoading(true)
                        if (
                          appWatchers.cIframeContent.url !== null &&
                          appWatchers.cIframeContent.name !== 'flow-see' &&
                          appWatchers.cIframeContent.name !== ''
                        ) {
                          ;(async () => {
                            const url = await getIframeUrl('flow-see')
                            const allow = await getIframeAllow('flow-see')
                            setNewApp({
                              url,
                              name: 'flow-see',
                              allow,
                            })
                            setOnChangeApp(true)
                          })()
                        } else {
                          if (isLoading) return
                          setIsLoading(true)
                          ;(async () => {
                            const url = await getIframeUrl('flow-see')
                            const allow = await getIframeAllow('flow-see')
                            contextAppActions.cUpdateIframeContent(
                              url,
                              'flow-see',
                              allow,
                            )
                            setIsLoading(false)
                          })()
                        }

                        if (usersWatchers.cUsersIsOpen) {
                          contextUsersActions.cToggleUsersOption()
                        }
                      }}
                    >
                      <>
                        <div
                          className={`flex aspect-square w-full items-center justify-center rounded-4xl p-2 transition-all duration-300 group-hover:rounded-none ${!isLoading && 'group-hover:bg-gray000'} ${appWatchers.cIframeContent.name === 'flow-see' && 'bg-gray100 rounded-none'}`}
                        >
                          <Image
                            src={ObserverIcon}
                            alt="icon"
                            width={100}
                            height={100}
                            style={{ width: '95%', height: 'auto' }}
                          />
                        </div>
                        <p>Flow-See</p>
                      </>
                    </button>
                  </li>
                </>

                {/* Separation for easier visualization */}
                {/* Flow Tell */}
                {showFlowTell && (
                  <>
                    <li
                      key="flow-tell"
                      className={`${isLoading ? 'opacity-50' : 'hover:cursor-pointer'}`}
                    >
                      <button
                        className="group relative mb-2 flex w-full flex-col items-center gap-px"
                        disabled={isLoading}
                        onMouseDown={handleFlowTell}
                      >
                        <>
                          <div
                            className={`flex aspect-square w-full items-center justify-center rounded-4xl p-2 transition-all duration-300 group-hover:rounded-none ${!isLoading && 'group-hover:bg-gray000'} ${appWatchers.cIframeContent.name === 'flow-see' && 'bg-gray100 rounded-none'}`}
                          >
                            <Image
                              src={FlowTellIcon}
                              alt="icon"
                              width={100}
                              height={100}
                              style={{ width: '100%', height: 'auto' }}
                            />
                          </div>
                          <p>Flow-Tell</p>
                        </>
                      </button>
                    </li>
                  </>
                )}
              </>
            )}

            {onChangeApp && <IframeConfirmOverlay action={handleChangeApp} />}
          </ul>
        </>
      )}
    </>
  )
}
