export type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'PATCH'
  | 'HEAD'
  | 'OPTIONS'

export type HttpResponse<T = any> = {
  status: number
  statusText: string
  headers: Headers
  data: T
}

export type HttpRequestOptions<T = any> = {
  method: string
  headers?: Record<string, string>
  queryParams?: Record<string, string | number>
  body?: T
}

export type Response<T = any> = {
  data: T
  success: boolean
  message: string
  statusCode: number
}
