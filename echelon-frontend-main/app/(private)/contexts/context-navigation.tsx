'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { NavigationContextType } from './navigation-context-types'

const NavigationContext = createContext<NavigationContextType | undefined>(
  undefined,
)

export const NavigationProvider = ({ children }: { children: ReactNode }) => {
  const [cUsersIsOpen, cSetUsersIsOpen] = useState(false)
  const [cIsAddingUsers, cSetIsAddingUsers] = useState(false)
  const [cIsSearchingUsers, cSetIsSearchingUsers] = useState(false)
  const [cIsUserAccountOpen, cSetIsUserAccountOpen] = useState(false)
  const [cIsUseCaseTeamsOpen, cSetIsUseCaseTeamsOpen] = useState(false)
  const [cIsUseCaseTeamManagementOpen, cSetIsUseCaseTeamManagementOpen] =
    useState(false)
  const [cIsAddUseCaseTeamOpen, cSetIsAddUseCaseTeamOpen] = useState(false)

  const [cIframeContent, cSetIframeContent] = useState<{
    url: string | null
    name: string | null
    allow?: string | null
  }>({ url: null, name: null })

  const contextUsersActions = {
    cSetUsersIsOpen,
    cToggleUsersOption: () => cSetUsersIsOpen((prev) => !prev),

    cSetIsAddingUsers,
    cToggleAddingUsers: () => cSetIsAddingUsers((prev) => !prev),

    cSetIsSearchingUsers,
    cToggleSearchUsers: () => cSetIsSearchingUsers((prev) => !prev),

    cSetIsUserAccountOpen,
    cToggleUserAccount: () => cSetIsUserAccountOpen((prev) => !prev),

    cSetIsUseCaseTeamsOpen,
    cToggleUseCaseTeams: () => cSetIsUseCaseTeamsOpen((prev) => !prev),

    cSetIsUseCaseTeamManagementOpen,
    cToggleUseCaseTeamManagement: () =>
      cSetIsUseCaseTeamManagementOpen((prev) => !prev),

    cSetIsAddUseCaseTeamOpen,
    cToggleAddUseCaseTeam: () => cSetIsAddUseCaseTeamOpen((prev) => !prev),
  }

  const contextAppActions = {
    cUpdateIframeContent: (url: string, name: string, allow?: string | null) =>
      cSetIframeContent({ url, name, allow }),
    cSetIframeContent,
  }

  const usersWatchers = {
    cUsersIsOpen,
    cIsAddingUsers,
    cIsSearchingUsers,
    cIsUserAccountOpen,
    cIsUseCaseTeamsOpen,
    cIsUseCaseTeamManagementOpen,
    cIsAddUseCaseTeamOpen,
  }

  const appWatchers = {
    cIframeContent,
  }

  return (
    <NavigationContext.Provider
      value={{
        contextUsersActions,
        usersWatchers,
        contextAppActions,
        appWatchers,
      }}
    >
      {children}
    </NavigationContext.Provider>
  )
}

export const useNavigationContext = (): NavigationContextType => {
  const context = useContext(NavigationContext)
  if (!context) {
    throw new Error(
      'useNavigationContext must be used within a NavigationProvider',
    )
  }
  return context
}
