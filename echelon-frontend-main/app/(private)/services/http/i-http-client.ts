import { HttpResponse } from './types'

export interface IHttpClient {
  get(
    endpoint: string,
    queryParams?: Record<string, string | number>,
    headers?: Record<string, string>,
  ): Promise<HttpResponse>

  post<TBody = any>(
    endpoint: string,
    body: TBody,
    headers?: Record<string, string>,
  ): Promise<HttpResponse>

  put<TBody = any>(
    endpoint: string,
    body: TBody,
    headers?: Record<string, string>,
  ): Promise<HttpResponse>

  delete(
    endpoint: string,
    queryParams?: Record<string, string | number>,
    headers?: Record<string, string>,
  ): Promise<HttpResponse>

  upload(
    endpoint: string,
    files: File | File[],
    additionalData?: Record<string, string | number>,
    headers?: Record<string, string>,
  ): Promise<HttpResponse>
}
