'use server'

import { PasswordResetSchema } from '@definitions/auth-definitions'
import { UseCaseTeam, User, UserAddForm } from '@definitions/user-definitions'

import { API_ROUTES } from './http/definitions'
import axiosClient from './http/http-client'
import { Response } from './http/types'

export async function searchAdUsers(term: string) {
  try {
    const url = API_ROUTES.USER_QUERY.GET_AD_USERS + '?search=' + term
    return await axiosClient.get<Response>(url)
  } catch (error) {
    console.error('[Error on searchAdUsers]: ', error)
    throw error
  }
}

export async function getAdUsers() {
  try {
    const url = API_ROUTES.USER_QUERY.GET_AD_USERS
    return await axiosClient.get<Response>(url)
  } catch (error) {
    console.error('[Error on getAdUsers]: ', error)
    throw error
  }
}

export async function searchLocationByTerm(term: string) {
  try {
    const url = API_ROUTES.USER_QUERY.SEARCH_LOCATION_BY_TERM + term
    return await axiosClient.get<Response>(url)
  } catch (error) {
    console.error('[Error on searchLocationByTerm]: ', error)
    throw error
  }
}

export async function getPermittedAccess() {
  try {
    const url = API_ROUTES.USER_QUERY.GET_PERMITTED_ACCESS
    return await axiosClient.get<Response>(url)
  } catch (error) {
    console.error('[Error on getPermittedAccess]: ', error)
    throw error
  }
}

export async function getUseCaseTeams() {
  try {
    const url = API_ROUTES.USER_QUERY.GET_USE_CASE_TEAMS
    return await axiosClient.get<Response>(url)
  } catch (error) {
    console.error('[Error on getUseCaseTeams]: ', error)
    throw error
  }
}

export async function getUseCaseTeamsMembersCount() {
  try {
    const url = API_ROUTES.USER_QUERY.GET_USE_CASE_TEAMS_MEMBERS_COUNT
    return await axiosClient.get<Response>(url)
  } catch (error) {
    console.error('[Error on getUseCaseTeamsMembersCount]: ', error)
    throw error
  }
}

export async function getUseCaseTeamById(id: string) {
  try {
    const url = API_ROUTES.USER_QUERY.GET_USE_CASE_TEAM_BY_ID + id
    return await axiosClient.get<Response>(url)
  } catch (error) {
    console.error('[Error on getUseCaseTeamById]: ', error)
    throw error
  }
}

export async function addUseCaseTeam(useCaseTeamFormData: {
  ownerId: User['id']
  name: UseCaseTeam['name']
  description: string
}): Promise<Response> {
  try {
    const url = API_ROUTES.USER_QUERY.ADD_USE_CASE_TEAM
    return axiosClient.post(url, useCaseTeamFormData)
  } catch (error) {
    console.error('[Error on addUseCaseTeam]: ', error)
    throw error
  }
}

export async function getUseCaseTeamsMaxTags() {
  const maxTags =
    process.env.NODE_ENV === 'production'
      ? process.env.NEXT_PUBLIC_USE_CASE_TEAMS_MAX_TAGS
      : process.env.USE_CASE_TEAMS_MAX_TAGS

  return maxTags
}

export async function addUser(userFormData: UserAddForm) {
  try {
    const response: Response = await axiosClient.post(
      API_ROUTES.USERS.ADD_USER,
      userFormData,
    )

    if (!response.success) {
      return {
        success: response.success,
        message: response.message || 'Error adding user',
        data: null,
        statusCode: response.statusCode,
      }
    }
    return {
      success: response.success,
      message: response.message || 'User added successfully',
      data: response.data,
      statusCode: response.statusCode,
    }
  } catch (error) {
    console.error('[Error on addUser]: ', error)
    return {
      success: false,
      message: 'Internal error adding user',
      data: null,
      statusCode: 500,
    }
  }
}

export async function searchUserByTerm(term: string) {
  try {
    const url = API_ROUTES.USER_QUERY.SEARCH_USERS_BY_TERM + term
    return axiosClient.get(url)
  } catch (error) {
    console.error('[Error on searchUsersByTerm]: ', error)
    throw error
  }
}

export async function resetSubordinatePassword(
  userId: User['id'],
  formData: PasswordResetSchema,
) {
  try {
    const url = API_ROUTES.USER_QUERY.RESET_SUBORDINATE_PASSWORD
    const body = {
      userId: userId,
      password: formData.password,
    }
    return await axiosClient.post(url, body)
  } catch (error) {
    console.error('[Error on resetSubordinatePassword]: ', error)
    throw error
  }
}

export async function resendActivationEmail(id: User['id']): Promise<Response> {
  try {
    const url = API_ROUTES.USER_QUERY.RESEND_ACTIVATION
    const body = {
      userId: id,
    }
    return await axiosClient.post(url, body)
  } catch (error) {
    console.error('[Error on resendActivationEmail]: ', error)
    throw error
  }
}

export async function activateUser(id: User['id']) {
  try {
    const url = API_ROUTES.USER_QUERY.ACTIVATE_USER + `/${id}`
    return await axiosClient.put<Response>(url)
  } catch (error) {
    console.error('[Error on activateUser]: ', error)
    throw error
  }
}

export async function deactivateUser(id: User['id']) {
  try {
    const url = API_ROUTES.USER_QUERY.DEACTIVATE_USER + `/${id}`
    return await axiosClient.put<Response>(url)
  } catch (error) {
    console.error('[Error on deactivateUser]: ', error)
    throw error
  }
}

// Is AD Search enabled?
export async function isAdSearchEnabled(): Promise<boolean> {
  return (
    process.env.NEXT_PUBLIC_ENABLE_AD_SEARCH === 'true' ||
    process.env.ENABLE_AD_SEARCH === 'true'
  )
}
