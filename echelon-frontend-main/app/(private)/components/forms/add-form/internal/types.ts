import {
  Access,
  UseCaseTeam,
  User,
  UserJWT,
  Location,
} from '@definitions/user-definitions'

// Types to use in form props
export type formProps = {
  data?: Record<string, any>
  callbacks?: {
    [key: string]:
      | ((...args: any[]) => void)
      | (() => void)
      | ((...args: any[]) => Promise<void>)
  }
}

// Types to use in form data
export type FormData = {
  email: User['email']
  firstName: User['firstName']
  lastName: User['lastName']
  locationId: User['location']['id'] | null
  useCaseTeamIds: UseCaseTeam['id'][]
  access: User['access']
  isSSO: boolean
}

// Types to use in form data to send to the API
export type FormDataToSend = {
  email: User['email']
  firstName: User['firstName']
  lastName: User['lastName']
  locationId: User['location']['id'] | null
  isSSO: boolean
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
  isADSearchEnabled: boolean
  userData: UserJWT
  accessOptions: Access[]
  useCaseTeamsOptions: UseCaseTeam[]
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
  isADSearchEnabled: boolean
  userData: TUserJWT
  accessOptions: TAccess[]
  useCaseTeamsOptions: TUseCaseTeam[]
  maxTags: number
}

// Type for value state on main component
export type TValues = IBuildForm

// For CreateUser class return
export type TCreateUser = {
  success: boolean
  error?: string
}
