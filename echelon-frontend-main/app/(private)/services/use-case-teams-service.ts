'use server'

import { UseCaseTeamDTO } from '../ui/sidebar/nav/users/use-case-teams/manage-use-case-team/types'
import { API_ROUTES } from './http/definitions'

// Http client is a service that contains methods to handle HTTP requests.
import axiosClient from './http/http-client'
import { Response } from './http/types'

// This function sends a request to the server to search location by term.
export async function listUseCaseTeams(): Promise<Response> {
  const url = `${API_ROUTES.USE_CASE_TEAMS.GET}`
  try {
    return await axiosClient.get<Response>(url)
  } catch (error) {
    throw console.error('[Error on search use case teams]: ', error)
  }
}

export async function updateUseCaseTeam(body: UseCaseTeamDTO): Promise<Response> {
  const url = `${API_ROUTES.USE_CASE_TEAMS.UPDATE}`
  try {
    return axiosClient.put<Response>(url, body)
  } catch (error) {
    console.error('[Error on update use case team]:', error)
    throw error
  }

}
