import { HttpStatus } from '@nestjs/common'

export type HttpResponse<T = any> = {
    statusCode: number
    data: T
    success: boolean
}

export const ok = <T = any>(data: T): HttpResponse<T> => ({
    statusCode: HttpStatus.OK,
    data,
    success: true,
})

export const created = <T = any>(data: T): HttpResponse<T> => ({
    statusCode: HttpStatus.CREATED,
    data,
    success: true,
})
