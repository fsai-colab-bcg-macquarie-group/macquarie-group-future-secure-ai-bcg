import { User } from "../definitions/user-definitions"

export type TuserJwtData = {
  aal: string
  amr: Array<{
    method: string
    timestamp: number
  }>
  app_metadata: {
    provider: string
    providers: string[]
  }
  aud: string
  email: string
  exp: number
  iat: number
  is_anonymous: boolean
  iss: string
  phone: string
  profile: {
    access_id: string
    access_name: string
    first_name: string
    last_name: string
  }
  role: string
  session_id: string
  sub: string
  use_case_teams: Array<{
    name: string
    use_case_team_id: string
  }>
  user_id: string
  user_metadata: Record<string, never>
  user_permissions: never[]
}

export type TuserData = {
  amr: Array<{
    method: string
    timestamp: number
  }>
  profile: {
    access_id: string
    access_name: string
    first_name: string
    last_name: string
  }
  email: string
  use_case_teams: any[]
  user_access_id: string
  user_id: string
  app_metadata: {
    provider: string
    providers: string[]
  }
  user_permissions: string[]
}

export type TselectedTeam = {
  name: string
  use_case_team_id: string
}

export type TmanagedUseCaseTeam = {
  id: string
  name: string
  ownerId: string
  ownerFirstName: string
  ownerLastName: string
  members: Array<{
    email: string
    userId: string
    lastName: string
    firstName: string
    accessName: string
  }>
}

export type UserDataContextType = {
  userContextWatchers: {
    cUserNameAbbreviated: string | null
    cUserData: TuserJwtData
    cSelectedTeam: TselectedTeam | null
    cManagedUser: User
    cMultiFactorStates: {
      isSSOUser: string
      hasMFAValidated: string
      factorId: string
      factorStatus: string
    }
    cManagedUseCaseTeam: TmanagedUseCaseTeam | null
  }
  userContextActions: {
    cUpdateSelectedTeam: (selectedTeam: {
      name: string
      use_case_team_id: string
    }) => void
    cUpdateManagedUser: (managedUser: User) => void
    cUpdateMultiFactorStates: (multiFactorStates: {
      isSSOUser: string
      hasMFAValidated: string
      factorId: string
      factorStatus: string
    }) => void
    cUpdateManagedUseCaseTeam: (managedUseCaseTeam: TmanagedUseCaseTeam) => void
  }
}

export type TProfile = {
  access_id: string
  access_name: string
  first_name: string
  last_name: string
}
