import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common'
import { IUserService } from 'src/domain/interfaces/services/auth-layer/users'
import { ILogLoginUserData } from 'src/repository/logger/auth-layer/auth/i-log-login-data'
import { ILogAuthenticationService } from 'src/services/interfaces/logger/auth-layer/i-log-authentication'
import { AuthenticationRepository } from '../../../repository/auth-layer/auth/authentication-repository'
import {
    ActionsType,
    FailureReasonType,
    StatusType,
    UserAccountStatus,
} from '../../../domain/auth-layer/auth/enum'
import { formatRemainingTime, throwHttpException } from 'src/utils'
import { IHistoryService } from '../history/i-history-service'
import { HistoryType } from '../history/type-history'
@Injectable()
export class LoginHandleService {
    constructor(
        @Inject('ILogAuthenticationService')
        private readonly logAuthService: ILogAuthenticationService,
        @Inject('IUserService')
        private readonly userService: IUserService,
        private readonly supabaseService: AuthenticationRepository,
        @Inject('IHistoryService')
        private readonly historyService: IHistoryService,
    ) {}
    async authenticationFailed(
        email: string,
        logMetadata: ILogLoginUserData,
    ): Promise<void> {
        const userId = await this.userService.selectByEmail(email, false)
        if (!userId) {
            const historyData = {
                action: ActionsType.LOGIN,
                success: false,
                email: email,
                user_id: userId || '',
                description: FailureReasonType.EMAIL,
                profile: '',
                metadata: {
                    user_login_status: StatusType.FAILED,
                    user_account_status: UserAccountStatus.UNLOCKED,
                    ...logMetadata,
                },
            }

            await this.historyService.createHistory(historyData)

            throwHttpException(
                'Email not found!',
                HttpStatus.NOT_FOUND,
                HttpStatus.NOT_FOUND,
            )
        }
        await this.handleFailedLogin(logMetadata, userId, email)
    }

    async handleSuccessfulLogin(
        userId: string,
        data: HistoryType,
    ): Promise<void> {
        await this.supabaseService.handleSuccessfulLogin(userId)
        await this.historyService.createHistory(data)
    }

    private async handleFailedLogin(
        logMedata: ILogLoginUserData,
        userId: string,
        email: string,
    ): Promise<void> {
        const remainingTimeSeconds =
            await this.supabaseService.handleFailedLogin(userId)

        const remainingTimeFormated = formatRemainingTime(remainingTimeSeconds)
        if (remainingTimeSeconds) {
            const historyData = {
                action: ActionsType.LOGIN,
                success: false,
                email: email,
                user_id: userId || '',
                description: FailureReasonType.LOCKED,
                profile: '',
                metadata: {
                    user_login_status: StatusType.FAILED,
                    user_account_status: UserAccountStatus.LOCKED,
                    ...logMedata,
                },
            }

            await this.historyService.createHistory(historyData)

            throw new HttpException(
                {
                    message: `Your account is still locked. Please try again after ${remainingTimeFormated}`,
                    remainingTimeSeconds,
                    statusCode: HttpStatus.TOO_MANY_REQUESTS,
                },
                HttpStatus.TOO_MANY_REQUESTS,
            )
        } else {
            const historyData = {
                action: ActionsType.LOGIN,
                success: false,
                email: email,
                user_id: userId || '',
                description: FailureReasonType.PASSWORD,
                profile: '',
                metadata: {
                    user_login_status: StatusType.FAILED,
                    user_account_status: UserAccountStatus.UNLOCKED,
                    ...logMedata,
                },
            }

            await this.historyService.createHistory(historyData)
        }
    }
}
