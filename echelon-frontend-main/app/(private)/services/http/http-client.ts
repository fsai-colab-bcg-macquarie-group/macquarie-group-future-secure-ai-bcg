import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios'
import { cookies } from 'next/headers'
import {
  isTokenAboutToExpire,
  isTokenExpired,
  refreshAccessToken,
} from '../jwt-service'
import { redirect } from 'next/navigation'

const deleteCookies = async () => {
  const cookieStore = await cookies()
  cookieStore.getAll().forEach((cookie) => cookieStore.delete(cookie.name))
}

// Definition of HTTP service
class AxiosClient {
  private instance: AxiosInstance

  constructor(baseURL: string = process.env.ENV_API || '') {
    this.instance = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // Allow to send cookies with the request
    })

    // Intercept requests and add token automatically
    this.instance.interceptors.request.use(
      async (config: any) => {
        const cookieStore = await cookies()
        let token = cookieStore.get('token')?.value as string
        if (!token) {
          await deleteCookies()
          redirect('/login')
        }

        const tokenExpired = await isTokenExpired(token)
        console.log(
          `${tokenExpired ? '🔴' : '✅'} TOKEN IS ${tokenExpired ? 'EXPIRED' : 'NOT EXPIRED'}`,
        )
        if (tokenExpired) {
          await deleteCookies()
          console.log('Token expired, redirecting to login')
          return redirect('/login')
        }

        const isTokenExpiring = await isTokenAboutToExpire(token)
        if (isTokenExpiring) {
          console.log(
            `${isTokenExpiring ? '🔴' : '✅'} TOKEN IS ${isTokenExpiring ? 'ABOUT TO EXPIRE' : 'NOT ABOUT TO EXPIRE'}`,
          )
          const refreshToken = cookieStore.get('refreshToken')?.value as string
          console.log(`${refreshToken ? '✅' : '🔴'} REFRESH TOKEN EXISTS`)
          const refreshed = await refreshAccessToken(refreshToken)
          if (refreshed) {
            token = cookieStore.get('token')?.value as string
            console.log(`${refreshed ? '✅' : '🔴'} TOKEN REFRESHED`)
          }
        }

        // if token is not expired, add it to the request headers
        if (token && !tokenExpired) {
          config.headers = {
            ...config.headers,
            Authorization: `Bearer ${token}`,
          }
        }
        return config
      },
      (error: AxiosError) => {
        throw error
      },
    )

    // Interceptor to handle responses (including 401)
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: any) => {
        console.log(error)
        if (error.response?.status === 401) {
          console.log('🔴 Unauthorized - Redirecting to login...')
          // Delete cookies (client or server)
          await deleteCookies()
          redirect('/login')
        }
        console.log('🔴 Axios Error on Request:', error.response?.data?.message)
        // throw error

        // Default response for errors
        return {
          success: false,
          message:
            error.response?.data?.message || 'Unexpected error on server',
          statusCode: error.response?.status || 500,
        }
      },
    )
  }

  // Method GET
  public async get<T>(url: string, params?: Record<string, any>): Promise<T> {
    const { data } = await this.instance.get<T>(url, { params })
    return data
  }

  // Method POST
  public async post<T>(url: string, body?: any): Promise<T> {
    const { data } = await this.instance.post<T>(url, body)
    return data
  }

  // Method PUT
  public async put<T>(url: string, body?: any): Promise<T> {
    const { data } = await this.instance.put<T>(url, body)
    return data
  }

  // Method DELETE
  public async delete<T>(url: string): Promise<T> {
    const { data } = await this.instance.delete<T>(url)
    return data
  }

  // Method UPLOAD of Files
  public async upload<T>(
    url: string,
    file: File | File[],
    additionalData?: Record<string, any>,
  ): Promise<T> {
    const formData = new FormData()

    if (Array.isArray(file)) {
      file.forEach((f, i) => formData.append(`file${i}`, f))
    } else {
      formData.append('file', file)
    }

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value))
      })
    }

    const response = await this.instance.post<T>(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    return response.data
  }
}

// Creating an instance of the HTTP service to be used globally
const axiosClient = new AxiosClient()

export default axiosClient
