export interface IframeContent {
  url: string | null
  name: string | null
  allow?: string | null
}

export type NavigationContextType = {
  usersWatchers: {
    cUsersIsOpen: boolean
    cIsAddingUsers: boolean
    cIsSearchingUsers: boolean
    cIsUserAccountOpen: boolean
    cIsUseCaseTeamsOpen: boolean
    cIsUseCaseTeamManagementOpen: boolean
    cIsAddUseCaseTeamOpen: boolean
  }
  contextUsersActions: {
    cToggleUsersOption: () => void
    cSetUsersIsOpen: (value: boolean) => void

    cToggleAddingUsers: () => void
    cSetIsAddingUsers: (value: boolean) => void

    cToggleSearchUsers: () => void
    cSetIsSearchingUsers: (value: boolean) => void

    cToggleUserAccount: () => void
    cSetIsUserAccountOpen: (value: boolean) => void

    cToggleUseCaseTeams: () => void
    cSetIsUseCaseTeamsOpen: (value: boolean) => void

    cToggleUseCaseTeamManagement: () => void
    cSetIsUseCaseTeamManagementOpen: (value: boolean) => void

    cToggleAddUseCaseTeam: () => void
    cSetIsAddUseCaseTeamOpen: (value: boolean) => void
  }
  appWatchers: {
    cIframeContent: IframeContent
  }
  contextAppActions: {
    cUpdateIframeContent: (
      url: string,
      name: string,
      allow?: string | null,
    ) => void
    cSetIframeContent: (value: {
      url: string | null
      name: string | null
      allow?: string | null
    }) => void
  }
}
