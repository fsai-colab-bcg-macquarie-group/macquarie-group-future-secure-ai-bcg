import { HttpException, HttpStatus } from '@nestjs/common'

export function throwHttpException(
    message: string,
    code?: string | number,
    status?: HttpStatus,
): never {
    throw new HttpException(
        {
            statusCode: status ?? HttpStatus.BAD_REQUEST,
            message,
            error: code ?? HttpStatus.BAD_REQUEST,
        },
        status ?? HttpStatus.BAD_REQUEST,
    )
}
