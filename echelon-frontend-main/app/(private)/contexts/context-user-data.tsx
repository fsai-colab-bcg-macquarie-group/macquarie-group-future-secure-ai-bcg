'use client'

import {
  createContext,
  FC,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react'

import { getUserFromCookies } from '@services/user-service'
// import { getUserProfile } from '@services/user-service'
import { getCookie } from '../services/cookie-service'
import {
  TmanagedUseCaseTeam,
  TmanagedUser,
  TuserJwtData,
  UserDataContextType,
} from './types'
import { PermissionsProvider } from './permissions-context'

const UserDataContext = createContext<UserDataContextType | undefined>(
  undefined,
)

interface UserDataProviderProps {
  children: ReactNode
}

export const UserDataProvider: FC<UserDataProviderProps> = ({ children }) => {
  const [userNameAbbreviated, setUserNameAbbreviated] = useState<string | null>(
    null,
  )
  const [userData, setUserData] = useState<TuserJwtData | null>(null)
  const [managedUser, setManagedUser] = useState<TmanagedUser | null>(null)
  const [selectedTeam, setSelectedTeam] = useState<{
    name: string
    use_case_team_id: string
  } | null>(null)
  const [multiFactorStates, setMultiFactorStates] = useState({
    isSSOUser: 'false',
    hasMFAValidated: 'false',
    factorId: '',
    factorStatus: '',
  })
  const [managedUseCaseTeam, setManagedUseCaseTeam] =
    useState<TmanagedUseCaseTeam | null>(null)

  useEffect(() => {
    onLoad()
  }, [])

  const getInitials = (fullName: string): string => {
    const names = fullName.split(' ')
    if (names.length < 2) return 'AI'
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
  }

  const onLoad = async () => {
    const userJwtData: TuserJwtData | null = await getUserFromCookies()

    if (!userJwtData) {
      return
    }

    const { first_name, last_name } = userJwtData.profile

    const userNameAbbreviated = getInitials(
      `${first_name}${last_name ? ` ${last_name}` : ''}`,
    )

    const selectedTeamId = await getCookie('selected_team_id')
    if (selectedTeamId && userJwtData.use_case_teams) {
      const matchingTeam = userJwtData.use_case_teams.find(
        (team) => team.use_case_team_id === selectedTeamId,
      )
      if (matchingTeam) {
        setSelectedTeam(matchingTeam)
      }
    }

    setUserNameAbbreviated(userNameAbbreviated)

    // I'm adding the user data and profile data to have everything in one place
    // We will change this later to a function that gets the user data from the cookies and the other from the database
    setUserData(userJwtData)
  }

  const userContextWatchers = {
    cUserNameAbbreviated: userNameAbbreviated,
    cUserData: userData,
    cSelectedTeam: selectedTeam,
    cManagedUser: managedUser,
    cMultiFactorStates: multiFactorStates,
    cManagedUseCaseTeam: managedUseCaseTeam,
  }

  const userContextActions = {
    cUpdateSelectedTeam: (selectedTeam: {
      name: string
      use_case_team_id: string
    }) => {
      setSelectedTeam(selectedTeam)
    },
    cUpdateManagedUser: (managedUser: TmanagedUser) => {
      setManagedUser(managedUser)
    },
    cUpdateMultiFactorStates: (multiFactorStates: {
      isSSOUser: string
      hasMFAValidated: string
      factorId: string
      factorStatus: string
    }) => {
      setMultiFactorStates(multiFactorStates)
    },
    cUpdateManagedUseCaseTeam: (managedUseCaseTeam: TmanagedUseCaseTeam) => {
      setManagedUseCaseTeam(managedUseCaseTeam)
    },
  }

  return (
    <UserDataContext.Provider
      value={{
        userContextWatchers,
        userContextActions,
      }}
    >
      <PermissionsProvider>{children}</PermissionsProvider>
    </UserDataContext.Provider>
  )
}

export const useDataContext = (): UserDataContextType => {
  const context = useContext(UserDataContext)
  if (!context) {
    throw new Error('UseDataContext must be used within a UserDataProvider')
  }
  return context
}
