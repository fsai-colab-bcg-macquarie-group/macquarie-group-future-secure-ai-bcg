import { Injectable, Scope } from '@nestjs/common'
import { PinoLogger } from 'nestjs-pino'
import type { Logger as Pino } from 'pino'
import { ILoggerService } from 'src/shared/services/interfaces/i-logger-service'

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService implements ILoggerService {
    private readonly contextLogger: Pino

    constructor(private readonly baseLogger: PinoLogger) {
        const context = this.constructor.name

        this.contextLogger = baseLogger?.logger?.child?.({ context }) ?? console
    }

    log(message: string, meta: Record<string, any> = {}) {
        this.contextLogger.info(meta, message)
    }

    error(message: string, meta: Record<string, any> = {}) {
        this.contextLogger.error(meta, message)
    }

    warn(message: string, meta: Record<string, any> = {}) {
        this.contextLogger.warn(meta, message)
    }

    debug(message: string, meta: Record<string, any> = {}) {
        this.contextLogger.debug(meta, message)
    }
}
