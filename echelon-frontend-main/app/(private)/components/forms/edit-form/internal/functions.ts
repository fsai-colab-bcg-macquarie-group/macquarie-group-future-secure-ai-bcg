import {
  FormBuildResult,
  IBuildForm,
  FormDataToSend,
  FormData,
  PermissionProps,
  TAccess,
  TUseCaseTeam,
  TRequestResponse,
  TUserJWT,
} from './types'
import { User, userUpdateSchema } from '@definitions/user-definitions'

import { allFields } from './helpers'
import { Permission } from './helpers'

import { getUserIdByEmail } from '@services/auth-service'
import { getUser, updateUser } from '@services/user-service'
import {
  getUseCaseTeamsMaxTags,
  getUseCaseTeams,
  getPermittedAccess,
} from '@services/user-query-service'

// ==========================================================================================================================

// To get all the data necessary to build and render the form
export class BuildForm implements IBuildForm {
  managedUser: any
  managedUserState = 'Deactivated' as const
  loggedUser: any
  disabledFields = {
    email: false,
    firstName: false,
    lastName: false,
    location: false,
    access: false,
    useCaseTeams: false,
  }
  accessOptions = [{ id: '', name: '' }]
  useCaseTeamsOptions = [{ id: '', name: '' }]
  maxTags = 1

  // Get user state from the API (usefull when refreshing the form)
  private async getUserState(id: User['id']) {
    const { status } = (await getUser(id)) || {}
    return status
  }
  // Get the access options permitted
  private async getAccessOptionsPermitted(): Promise<TAccess[]> {
    const response = await getPermittedAccess()
    if (response && 'data' in response) {
      return response.data as TAccess[]
    }
    return []
  }
  // Get the use case teams options permitted
  private async getUseCaseTeamsPermitted(): Promise<TUseCaseTeam[]> {
    const response = await getUseCaseTeams()
    if (response && 'data' in response) {
      return response.data as TUseCaseTeam[]
    }
    return []
  }
  // Get the max tags
  private async getMaxTags() {
    const reponse = await getUseCaseTeamsMaxTags()
    return reponse ? parseInt(reponse) : 1
  }
  // Get the disabled fields based on the user access and the managed user access
  private async getDisabledFieldsMap({
    loggedUserAccess,
    managedAccess,
    managedProvider,
  }: Omit<PermissionProps, 'field'>): Promise<
    Record<PermissionProps['field'], boolean>
  > {
    const entries = await Promise.all(
      allFields.map(async (field) => {
        const isPermitted = await Permission({
          loggedUserAccess,
          managedAccess,
          managedProvider,
          field,
        })

        return [field, !isPermitted] // If not permitted, it is disabled
      }),
    )

    return Object.fromEntries(entries)
  }

  // Build the form
  async build({
    loggedUser,
    managedUser,
  }: {
    loggedUser: TUserJWT
    managedUser: User
  }): Promise<FormBuildResult> {
    // Always get the managed user profile from the Database
    this.managedUser = await new GetUserProfile().get(managedUser.email)

    // Get the managed user state from the Database
    this.managedUserState = (await this.getUserState(
      managedUser.id,
    )) as 'Deactivated'

    // Get the logged user (repass the logged user context)
    this.loggedUser = loggedUser

    // Get the disabled fields
    this.disabledFields = await this.getDisabledFieldsMap({
      loggedUserAccess: loggedUser.profile.access_name,
      managedAccess: managedUser.access.name,
      managedProvider: managedUser.provider,
    })

    // Get the access options
    this.accessOptions = await this.getAccessOptionsPermitted()

    // Get the use case teams options
    this.useCaseTeamsOptions = await this.getUseCaseTeamsPermitted()

    // Get the max tags
    this.maxTags = await this.getMaxTags()

    return {
      managedUser: this.managedUser,
      managedUserState: this.managedUserState,
      loggedUser: this.loggedUser,
      disabledFields: this.disabledFields,
      accessOptions: this.accessOptions,
      useCaseTeamsOptions: this.useCaseTeamsOptions,
      maxTags: this.maxTags,
    }
  }
}

// To update the user in Database
export class UpdateUser implements TRequestResponse {
  success = false
  error = ''

  // Format the data to be sent to the API
  private async buildSubmitForm(formData: FormData) {
    return {
      id: formData.id,
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      locationId: formData.locationId || null,
      accessId: formData.access.id,
      useCaseTeamIds: formData.useCaseTeams.map(
        (team: TUseCaseTeam) => team.id,
      ),
    }
  }

  // Validate the form on Zod
  private async validateForm(submitForm: FormDataToSend) {
    return userUpdateSchema.parse(submitForm)
  }

  // main method to update the user
  async update(formData: FormData): Promise<TRequestResponse> {
    const buildedForm = await this.buildSubmitForm(formData)
    const validatedForm = await this.validateForm(buildedForm)
    const response = await updateUser(validatedForm)

    if (response && response.statusCode === 200) {
      this.success = true
      return {
        success: this.success,
      }
    } else {
      this.success = false
      this.error = 'Error updating user'
      return {
        success: this.success,
        error: this.error,
      }
    }
  }
}

// To get the user profile
export class GetUserProfile {
  userProfile: User | null = null

  private async getUserProfile(email: User['email']) {
    const { data: userData } = await getUserIdByEmail(email, true)
    if (userData.user_id) {
      const userId = userData.user_id
      const userProfile = await getUser(userId)
      return userProfile
    }
    return null
  }

  async get(email: User['email']) {
    const userProfile = await this.getUserProfile(email)
    return userProfile
  }
}
