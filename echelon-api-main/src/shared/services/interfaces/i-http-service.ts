import { HttpClientResponse } from 'src/shared/domains/http-client/http-client-response'

export interface IHttpClientService {
    get<T>(
        url: string,
        headers?: Record<string, string>,
    ): Promise<HttpClientResponse<T>>
    post<T>(
        url: string,
        body: unknown,
        headers?: Record<string, string>,
        contentType?: string,
    ): Promise<HttpClientResponse<T>>
    put<T, B>(
        url: string,
        body: B,
        headers?: Record<string, string>,
    ): Promise<HttpClientResponse<T>>
    delete<T>(
        url: string,
        headers?: Record<string, string>,
    ): Promise<HttpClientResponse<T>>
}
