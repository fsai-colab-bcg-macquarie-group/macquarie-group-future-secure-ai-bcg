import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common'
import { Logger } from 'nestjs-pino'
import { Observable, catchError, tap, throwError } from 'rxjs'
import { HttpException } from '@nestjs/common'

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
    constructor(private readonly logger: Logger) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest<Request>()
        const method = request?.method || 'N/A'
        const url = request?.url || 'N/A'
        const now = Date.now()

        return next.handle().pipe(
            tap(() => {
                const ms = Date.now() - now
                this.logger.log({ context: 'HTTP' }, `${method} ${url} ${ms}ms`)
            }),
            catchError((error) => {
                const ms = Date.now() - now

                if (error instanceof HttpException) {
                    const statusCode = error.getStatus()
                    const response = error.getResponse()
                    const message =
                        typeof response === 'string'
                            ? response
                            : (response as any).message || 'Error'

                    this.logger.error(
                        {
                            context: 'HTTP',
                            statusCode,
                            method,
                            url,
                            responseTime: `${ms}ms`,
                            message,
                        },
                        `Request failed: ${method} ${url}`,
                    )
                } else {
                    this.logger.error(
                        {
                            context: 'HTTP',
                            method,
                            url,
                            responseTime: `${ms}ms`,
                            message:
                                error instanceof Error
                                    ? error.message
                                    : 'Unknown error',
                            stack:
                                error instanceof Error
                                    ? error.stack
                                    : undefined,
                        },
                        `Unhandled exception: ${method} ${url}`,
                    )
                }

                return throwError(() => error)
            }),
        )
    }
}
