import {
  FormBuildResult,
  IBuildForm,
  TAccess,
  TUseCaseTeam,
  TUserJWT,
  FormData,
  FormDataToSend,
  TCreateUser,
} from './types'

import { User } from '@definitions/user-definitions'

import {
  addUser,
  getPermittedAccess,
  getUseCaseTeams,
  getUseCaseTeamsMaxTags,
} from '@services/user-query-service'
import { getUserIdByEmail } from '@services/auth-service'
import { getUser } from '@services/user-service'

import { isAdSearchEnabled } from '@services/user-query-service'

// ==========================================================================================================================

// To get all the data necessary to build and render the form
export class BuildForm implements IBuildForm {
  isADSearchEnabled = false
  userData: any
  accessOptions = [{ id: '', name: '' }]
  useCaseTeamsOptions = [{ id: '', name: '' }]
  maxTags = 1

  // Verify if the AD search is enabled
  private async verifyADSearchENV(): Promise<boolean> {
    return await isAdSearchEnabled()
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
  // Build the form
  async build(userData: TUserJWT): Promise<FormBuildResult> {
    this.isADSearchEnabled = await this.verifyADSearchENV()
    this.userData = userData
    this.accessOptions = await this.getAccessOptionsPermitted()
    this.useCaseTeamsOptions = await this.getUseCaseTeamsPermitted()
    this.maxTags = await this.getMaxTags()

    return {
      isADSearchEnabled: this.isADSearchEnabled,
      userData: this.userData,
      accessOptions: this.accessOptions,
      useCaseTeamsOptions: this.useCaseTeamsOptions,
      maxTags: this.maxTags,
    }
  }
}

// To process form data and send to the API
export class CreateUser implements TCreateUser {
  success = false
  error = ''

  // Format the form data to send to the backend (in special, spaces between compost names)
  private formatData(formData: FormData): FormDataToSend {
    return {
      ...formData,
      accessId: formData.access.id,
      locationId:
        formData.locationId && formData.locationId?.length > 0
          ? formData.locationId
          : null,
      firstName: formData.firstName
        .trim()
        .split(' ')
        .filter((word) => word !== '')
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        )
        .join(' '),
      lastName: formData.lastName
        .trim()
        .split(' ')
        .filter((word) => word !== '')
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        )
        .join(' '),
      isSSO: formData.isSSO === null ? false : formData.isSSO,
      // Converte array de objetos para array de strings (IDs)
      useCaseTeamIds: Array.isArray(formData.useCaseTeamIds)
        ? formData.useCaseTeamIds.map((team: any) =>
            typeof team === 'string' ? team : team.id,
          )
        : [],
    }
  }
  // Call the service to create the user in backend
  private async callAPI(formData: FormDataToSend) {
    const response = await addUser(formData)
    return response
  }

  // Return the error or success
  async create(formData: FormData) {
    const formattedData = this.formatData(formData)
    const response = await this.callAPI(formattedData)

    // If the user is created successfully
    if (response && 'data' in response) {
      this.success = true
      return {
        success: this.success,
      }
    } else {
      // If the user is not created successfully
      this.success = false
      this.error = "Sorry, we couldn't create the user. Please try again."
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
