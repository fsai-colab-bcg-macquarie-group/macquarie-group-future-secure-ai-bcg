import { Inject, Injectable } from '@nestjs/common'
import { LogStatusType } from 'src/repository/logger/auth-layer/auth/enum/log-status-type'
import { ILogAuthenticationRepository } from 'src/repository/logger/auth-layer/auth/i-log-authentication-repository'
import { ILogLoginUserData } from 'src/repository/logger/auth-layer/auth/i-log-login-data'
import { ILogAuthenticationService } from 'src/services/interfaces/logger/auth-layer/i-log-authentication'

@Injectable()
export class LogAuthenticationService implements ILogAuthenticationService {
    constructor(
        @Inject('ILogAuthenticationRepository')
        private readonly logAuthRepo: ILogAuthenticationRepository,
    ) {}

    async saveLoginUserSuccess(data: ILogLoginUserData): Promise<void> {
        const newdata = {
            ...data,
            status: LogStatusType.SUCCESS,
            created_at: new Date(),
        }
        await this.logAuthRepo.saveLog(newdata, 'log_users_login')
    }

    async saveLoginUserFailure(data: ILogLoginUserData): Promise<void> {
        const newdata = {
            ...data,
            status: LogStatusType.FAILURE,
            created_at: new Date(),
        }
        await this.logAuthRepo.saveLog(newdata, 'log_users_login')
    }
}
