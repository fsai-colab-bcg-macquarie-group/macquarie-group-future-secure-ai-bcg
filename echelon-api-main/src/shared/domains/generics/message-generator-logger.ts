import { Logger } from '@nestjs/common'

export class MessageGeneratorLogger {
    static logMethodCall(className: string, methodName: string) {
        const logger = new Logger(className)
        logger.log(`${methodName} method called`)
    }
}
