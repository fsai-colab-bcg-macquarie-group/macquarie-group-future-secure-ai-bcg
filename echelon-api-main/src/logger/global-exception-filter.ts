import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
} from '@nestjs/common'
import { Logger } from 'nestjs-pino'

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    constructor(private readonly logger: Logger) {}

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp()
        const response = ctx.getResponse<any>()
        const request = ctx.getRequest<Request>()
        const method = request.method
        const url = request.url

        let status = HttpStatus.INTERNAL_SERVER_ERROR
        let message = 'Internal server error'

        if (exception instanceof HttpException) {
            status = exception.getStatus()
            const res = exception.getResponse()
            message =
                typeof res === 'string'
                    ? res
                    : (res as any)?.message || exception.message || message
        } else if (exception instanceof Error) {
            message = exception.message
        }

        if ((exception as any)?.alreadyLogged) {
            return response.status(status).json({
                statusCode: status,
                timestamp: new Date().toISOString(),
                path: url,
                message,
            })
        }

        ;(exception as any).alreadyLogged = true

        this.logger.error(
            {
                context: 'GlobalExceptionFilter',
                statusCode: status,
                method,
                url,
                message,
                stack: (exception as any)?.stack,
            },
            `❌ Exception thrown: ${method} ${url}`,
        )

        // Retorna resposta padrão para o cliente
        response.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: url,
            message,
        })
    }
}
