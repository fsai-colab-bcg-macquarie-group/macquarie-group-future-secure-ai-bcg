import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'
import { LoggerService } from './logger-service'

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    constructor(private readonly logger: LoggerService) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const handlerName = context.getHandler().name
        const className = context.getClass().name

        this.logger.log(`[${className}] ${handlerName} - Handling request`)

        return next
            .handle()
            .pipe(
                tap(() =>
                    this.logger.log(
                        `[${className}] ${handlerName} - Successfully handled request`,
                    ),
                ),
            )
    }
}
