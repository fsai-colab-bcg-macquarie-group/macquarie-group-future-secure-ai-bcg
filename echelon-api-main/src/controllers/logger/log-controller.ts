import { Body, Controller, Inject, Post, Req } from '@nestjs/common'
import { LogStatusType } from 'src/repository/logger/auth-layer/auth/enum/log-status-type'
import { IHeaderMetadata } from 'src/repository/logger/auth-layer/auth/i-log-login-data'
import { AddlogLoginRequest } from 'src/repository/logger/auth-layer/auth/request/add-log-login-request'
import { ILogAuthenticationService } from 'src/services/interfaces/logger/auth-layer/i-log-authentication'

@Controller('logger')
export class LogController {
    constructor(
        @Inject('ILogAuthenticationService')
        private readonly logAuthService: ILogAuthenticationService,
    ) {}

    @Post(`login-sso`)
    async logLoginSSO(
        @Req() req: any,
        @Body() data: AddlogLoginRequest,
        @Body('headerData') headerData?: IHeaderMetadata,
    ): Promise<void> {
        const { status, userId, email } = data
        const ip =
            headerData?.ip ||
            req.ip ||
            req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress
        const device = headerData?.device || req.headers['user-agent']
        const browser = headerData?.browser || req.headers['user-agent']

        if (status === LogStatusType.SUCCESS) {
            await this.logAuthService.saveLoginUserSuccess({
                user_id: data.userId || null,
                email: email || null,
                ip,
                device,
                browser,
            })
            return
        }
        await this.logAuthService.saveLoginUserFailure({
            user_id: userId || null,
            email: email || null,
            ip,
            device,
            browser,
        })
    }
}
