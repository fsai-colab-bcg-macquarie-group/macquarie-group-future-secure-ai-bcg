import { TuserJwtData } from '@contexts/types'
import {
  Access,
  UseCaseTeam,
  User,
  UserJWT,
  Location,
} from '@definitions/user-definitions'

// Types to use in form data
export type FormData = {
  id: User['id']
  email: User['email']
  firstName: User['firstName']
  lastName: User['lastName']
  locationId: User['location']['id'] | null
  useCaseTeams: UseCaseTeam[]
  access: User['access']
}

// Types to use in form data to send to the API
export type FormDataToSend = {
  id: User['id']
  email: User['email']
  firstName: User['firstName']
  lastName: User['lastName']
  locationId: User['location']['id'] | null
  accessId: User['access']['id']
  useCaseTeamIds: UseCaseTeam['id'][]
}

// Types to use in form reducer
export type ReducerActions =
  | {
      type: 'SET_FIELD'
      field: keyof FormData
      value: FormData[keyof FormData]
    }
  | {
      type: 'SET_MULTIPLE_FIELDS'
      fields: Partial<FormData>
    }
  | {
      type: 'RESET'
    }

// Types to use in returns of functions of classes
export interface FormBuildResult {
  managedUser: TUser
  managedUserState: 'Deactivated' | 'Activated' | 'Pending Activation'
  loggedUser: TuserJwtData
  disabledFields: Record<PermissionProps['field'], boolean>
  accessOptions: TAccess[]
  useCaseTeamsOptions: TUseCaseTeam[]
  maxTags: number
}

// Types to use in returns of functions of classes
export type TUser = User
export type TUserJWT = UserJWT
export type TLocation = Location
export type TAccess = Access
export type TUseCaseTeam = UseCaseTeam

// Interface to implement the BuildForm class
export interface IBuildForm {
  managedUser: TUser
  managedUserState: 'Deactivated' | 'Activated' | 'Pending Activation'
  loggedUser: TuserJwtData
  disabledFields: Record<PermissionProps['field'], boolean>
  accessOptions: TAccess[]
  useCaseTeamsOptions: TUseCaseTeam[]
  maxTags: number
}

// Type for value state on main component
export type TValues = IBuildForm

// Types to use in permissions fileds
export interface PermissionProps {
  loggedUserAccess: User['access']['name']
  managedAccess: User['access']['name']
  managedProvider: User['provider']
  field:
    | 'email'
    | 'firstName'
    | 'lastName'
    | 'location'
    | 'access'
    | 'useCaseTeams'
}

// For UpdateUser class return
export type TRequestResponse = {
  success: boolean
  error?: string
}

// For useState Values
export type TFlux =
  | 'edit'
  | 'activate'
  | 'deactivate'
  | 'resetPassword'
  | 'resendActivation'

// For useState Form mode
export type TMode = 'view' | 'edit'
