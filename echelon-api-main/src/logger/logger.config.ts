// logger.config.ts
import { LoggerModuleAsyncParams } from 'nestjs-pino'
import util from 'util'

export const createLoggerOptions =
    (): LoggerModuleAsyncParams['useFactory'] => {
        return () => {
            return {
                pinoHttp: {
                    transport: {
                        target: 'pino-pretty',
                        options: {
                            colorize: true,
                            singleLine: true,
                            translateTime: 'yyyy-mm-dd HH:MM:ss.l',
                            ignore: 'pid,hostname',
                            messageFormat: '[{context}] {msg}',
                        },
                    },
                    serializers: {
                        req(req) {
                            return {
                                method: req.method,
                                url: req.url,
                            }
                        },
                        res(res) {
                            return {
                                statusCode: res.statusCode,
                            }
                        },
                    },
                    ignore(res: any) {
                        return res.statusCode < 400
                    },
                    autoLogging: false,
                    formatters: {
                        log(obj) {
                            return {
                                msg:
                                    obj?.msg ||
                                    obj?.message ||
                                    util.inspect(obj, {
                                        depth: 2,
                                        breakLength: 100,
                                    }),
                                context: obj?.context || 'App',
                            }
                        },
                    },
                    customLogLevel(res: any, err: any) {
                        if (res.statusCode >= 500 || err) return 'error'
                        if (res.statusCode >= 400) return 'warn'
                        return 'info'
                    },
                    customSuccessMessage(req, res) {
                        if (res.statusCode === 200 || res.statusCode === 201) {
                            return `✅ HTTP ${req.method} ${req.url} → ${res.statusCode}`
                        }
                        return ''
                    },
                    customErrorMessage(req, res, err) {
                        return `❌ HTTP ${req.method} ${req.url} → ${res.statusCode} | ${err?.message}`
                    },
                },
            }
        }
    }
