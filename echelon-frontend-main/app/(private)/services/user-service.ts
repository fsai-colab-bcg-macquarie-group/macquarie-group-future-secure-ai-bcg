'use server'

import { extractTokenInfo } from '@services/jwt-service'
import { getCookie } from '@services/cookie-service'
import httpClient from './http/client'
import { API_ROUTES } from './http/definitions'
import { User, UserUpdateForm } from '../definitions/user-definitions'
import axiosClient from './http/http-client'
import { Response } from './http/types'

export async function saveUser(addUser: any): Promise<Response> {
  try {
    return await axiosClient.post(API_ROUTES.USERS.ADD_USER, addUser)
  } catch (error) {
    throw console.error('[Error on saveUser]: ', error)
  }
}

export async function getUser(userId: User['id']): Promise<User | null> {
  const url = `${API_ROUTES.USERS.VIEW_USER_PROFILE}${userId}`
  const { data } = await axiosClient.get<Response>(url)
  if (data) return data
  return null
}

export async function updateUser(updateUser: UserUpdateForm) {
  try {
    const url = `${API_ROUTES.USERS.UPDATE_PROFILE}`
    return await axiosClient.put<Response>(url, updateUser)
  } catch (error: any) {
    throw console.error('[Error on updateUser]: ', error)
  }
}

// Get the user from the cookie
export async function getUserFromCookies() {
  try {
    const token = await getCookie('token')

    if (!token) return null

    const profile: any = await extractTokenInfo(token)

    if (!profile) return null

    return profile
  } catch (error) {
    console.error(
      '[getUser]: An error are ocurred on try to get user from cookie',
      error,
    )
    throw error
  }
}

export async function getUserAccess() {
  const url = `${API_ROUTES.USERS.ACCESS_USER}`
  const response = await httpClient.get(url)
  return response.data
}

export default async function getDomainsFromEnv() {
  // In production uses NEXT_PUBLIC_ALLOWED_DOMAINS, in dev uses ALLOWED_DOMAINS
  const allowedDomains =
    process.env.NODE_ENV === 'production'
      ? process.env.NEXT_PUBLIC_ALLOWED_DOMAINS?.split(',').map((d) =>
        d.trim(),
      ) || []
      : process.env.ALLOWED_DOMAINS?.split(',').map((d) => d.trim()) || []

  return allowedDomains
}
