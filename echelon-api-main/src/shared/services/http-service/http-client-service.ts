// src/common/services/http-client.service.ts

import { Injectable } from '@nestjs/common'
import { HttpClientResponse } from 'src/shared/domains/http-client/http-client-response'
import { IHttpClientService } from 'src/shared/services/interfaces/i-http-service'

@Injectable()
export class HttpClientService implements IHttpClientService {
    async get<T>(
        url: string,
        headers?: Record<string, string>,
    ): Promise<HttpClientResponse<T>> {
        const response = await this.request<T>(url, {
            method: 'GET',
            headers: { ...headers },
        })
        return response
    }

    async post<T>(
        url: string,
        body: any,
        headers?: Record<string, string>,
        contentType?: string,
    ): Promise<HttpClientResponse<T>> {
        const response = await this.request<T>(url, {
            method: 'POST',
            headers: {
                ...headers,
                'Content-Type': contentType || 'application/json',
            },
            body: contentType ? body : JSON.stringify(body),
        })
        return response
    }

    async put<T, B>(
        url: string,
        body: B,
        headers?: Record<string, string>,
    ): Promise<HttpClientResponse<T>> {
        const response = await this.request<T>(url, {
            method: 'PUT',
            headers: {
                ...headers,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        })
        return response
    }

    async delete<T>(
        url: string,
        headers?: Record<string, string>,
    ): Promise<HttpClientResponse<T>> {
        const response = await this.request<T>(url, {
            method: 'DELETE',
            headers: { ...headers },
        })

        return response
    }

    private async request<T>(
        url: string,
        options: RequestInit,
    ): Promise<HttpClientResponse<T>> {
        const response = await fetch(url, options)

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Request failed')
        }

        const body: T = await response.json()

        const httpResponseFormatted: HttpClientResponse<T> = {
            body,
            statusCode: response.status,
        }

        return httpResponseFormatted
    }
}
