export type HttpClientResponse<B> = {
    statusCode: number
    headers?: Record<string, string>
    body: B
}
