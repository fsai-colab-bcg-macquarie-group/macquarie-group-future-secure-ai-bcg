import { cookies } from 'next/headers'
import { getCookie } from '../cookie-service'
import { IHttpClient } from './i-http-client'
import { HttpRequestOptions, HttpResponse } from './types'
import { NextRequest, NextResponse } from 'next/server'

export class HttpClient implements IHttpClient {
  private baseUrl: string

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl || process.env.ENV_API
  }

  private buildUrl(
    endpoint: string,
    queryParams?: Record<string, string | number>,
  ): string {
    const base = this.baseUrl.endsWith('/') ? this.baseUrl : `${this.baseUrl}/`
    const path = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint

    const url = new URL(path, base)

    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => {
        url.searchParams.append(key, String(value))
      })
    }

    return url.toString()
  }

  private async request<TBody = any>(
    endpoint: string,
    options: HttpRequestOptions<TBody>,
  ): Promise<HttpResponse> {
    // ========= get the request method, headers, query params and body =========
    const { method, headers = {}, queryParams, body } = options
    const url = this.buildUrl(endpoint, queryParams)

    // ========= get the access token =========
    const accessToken = await getCookie('token')

    // ========= add the access token to the headers =========
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`
    }

    // ========= try to make the request =========
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
      })

      // ========= if the response is 401, delete the token and refresh token and redirect to the login page =========
      if (response.status === 401) {
        const cookieStore = await cookies()
        cookieStore.delete('token')
        cookieStore.delete('refreshToken')
        cookieStore.delete('user')
        return Promise.resolve({
          status: 401,
          message: 'Unauthorized',
          headers: response.headers,
          data: null,
          statusText: response.statusText,
        })
      }

      let responseData: any
      const contentType = response.headers.get('Content-Type')

      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json()
      } else {
        responseData = await response.text()
      }

      if (!response.ok) {
        const errorMessage =
          responseData && responseData.data
            ? responseData.data
            : responseData && responseData.message
              ? responseData.message
              : 'An error occurred'

        return Promise.reject({
          status: response.status,
          message: errorMessage,
          data: responseData,
        })
      }

      return {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: responseData,
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return Promise.reject({
          status: 0,
          message: 'Request was aborted',
        })
      } else {
        return Promise.reject({
          status: error.status || 0,
          message: error.message || 'Network error occurred',
        })
      }
    }
  }

  public get(
    endpoint: string,
    queryParams?: Record<string, string | number>,
    headers?: Record<string, string>,
  ): Promise<HttpResponse> {
    return this.request(endpoint, { method: 'GET', headers, queryParams })
  }

  public post<TBody = any>(
    endpoint: string,
    body: TBody,
    headers?: Record<string, string>,
  ): Promise<HttpResponse> {
    return this.request<TBody>(endpoint, { method: 'POST', headers, body })
  }

  public put<TBody = any>(
    endpoint: string,
    body: TBody,
    headers?: Record<string, string>,
  ): Promise<HttpResponse> {
    return this.request<TBody>(endpoint, { method: 'PUT', headers, body })
  }

  public delete(
    endpoint: string,
    queryParams?: Record<string, string | number>,
    headers?: Record<string, string>,
  ): Promise<HttpResponse> {
    return this.request(endpoint, { method: 'DELETE', headers, queryParams })
  }

  public async upload(
    endpoint: string,
    files: File | File[],
    additionalData?: Record<string, string | number>,
    headers?: Record<string, string>,
  ): Promise<HttpResponse> {
    const url = this.buildUrl(endpoint)

    const formData = new FormData()

    if (Array.isArray(files)) {
      files.forEach((file, index) => formData.append(`file${index}`, file))
    } else {
      formData.append('file', files)
    }

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value))
      })
    }

    const accessToken = await getCookie('token')

    if (accessToken) {
      headers = {
        ...headers,
        Authorization: `Bearer ${accessToken}`,
      }
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          ...headers,
        },
        body: formData,
      })

      let responseData: any
      const contentType = response.headers.get('Content-Type')

      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json()
      } else {
        responseData = await response.text()
      }

      if (!response.ok) {
        const errorMessage =
          responseData && responseData.data
            ? responseData.data
            : responseData && responseData.message
              ? responseData.message
              : 'An error occurred'

        return Promise.reject({
          status: response.status,
          message: errorMessage,
          data: responseData,
        })
      }

      return {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: responseData,
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return Promise.reject({
          status: 0,
          message: 'Request was aborted',
        })
      } else {
        return Promise.reject({
          status: error.status || 0,
          message: error.message || 'Network error occurred',
        })
      }
    }
  }
}

const httpClient = new HttpClient()

export default httpClient
