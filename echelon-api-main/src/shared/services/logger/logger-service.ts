import { Injectable, Logger } from '@nestjs/common'
import { ILoggerService } from 'src/shared/services/interfaces/i-logger-service'

@Injectable()
export class LoggerService implements ILoggerService {
    private readonly logger = new Logger()

    log(message: string): void {
        this.logger.log(message)
    }

    warn(message: string): void {
        this.logger.warn(message)
    }

    error(message: string, meta?: Record<string, any>): void {
        this.logger.error(message, meta)
    }

    debug(message: string): void {
        this.logger.debug(message)
    }
}
