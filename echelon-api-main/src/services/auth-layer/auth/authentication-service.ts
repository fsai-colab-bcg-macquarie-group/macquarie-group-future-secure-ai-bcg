import {
    BadRequestException,
    Inject,
    Injectable,
    MethodNotAllowedException,
} from '@nestjs/common'
import { env } from 'src/config/env'
import {
    ActionsType,
    LoginMethodType,
    StatusType,
} from 'src/domain/auth-layer/auth/enum'
import {
    ConfirmationEmailRequest,
    GenerateActivateLinkRequest,
    ISignOutRequest,
    ISupabaseHeadersRequest,
    MFAChallengeRequest,
    MFAChallengeVerifyRequest,
    MFAEnrollRequest,
    MFAUnenrollRequest,
    MFAVerifyRequest,
    ResetPasswordRequest,
} from 'src/domain/auth-layer/auth/request'
import { AuthenticationUserRequest } from 'src/domain/auth-layer/auth/request/authentication-user-request'
import { SubordinateResetPasswordRequest } from 'src/domain/auth-layer/auth/request/subordinate-reset-password'
import {
    AuthenticatorAssuranceLevelResponse,
    MFAChallengeResponse,
    AuthUserResponse,
    MFAChallengeVerifyResponse,
    MFAEnrollResponse,
    MFAUnenrollResponse,
    MFAVerifyResponse,
    RefreshTokenResponse,
    ResetPasswordResponse,
    MFAListResponse,
    MFARemoveUnverifiedFactorsResponse,
} from 'src/domain/auth-layer/auth/response'
import { IAuthenticationService } from 'src/domain/interfaces/services/auth-layer/auth'
import { IAuthenticationRepository } from 'src/domain/interfaces/services/auth-layer/auth/i-authentication-repository'
import { IUserService } from 'src/domain/interfaces/services/auth-layer/users'
import { ILogLoginUserData } from 'src/repository/logger/auth-layer/auth/i-log-login-data'
import { IEMailNotificationService } from 'src/shared/services/interfaces/notification'
import { formatExpirationTime } from 'src/utils'

import { LoginHandleService } from './login-handle-service'
import JwtUtils from 'src/utils/jwt-utils'
import { UserAccountStatus } from 'src/domain/auth-layer/auth/enum'
@Injectable()
export class AuthenticationService implements IAuthenticationService {
    constructor(
        @Inject('IAuthenticationRepository')
        private readonly authRepository: IAuthenticationRepository,
        private readonly loginHandle: LoginHandleService,
        @Inject('IEMailNotificationService')
        private readonly emailService: IEMailNotificationService,
        @Inject('IUserService')
        private readonly userService: IUserService,
    ) {}

    async generateActivateLink(
        data: GenerateActivateLinkRequest,
    ): Promise<boolean> {
        const userData = await this.userService.select({
            id: data.userId,
            token: data.token,
        })
        if (!userData) {
            return false
        }
        if (userData.provider === 'SSO') {
            const emailConfirmedAt = formatExpirationTime(
                env.TIME_EXPIRATION_CONFIRMED_EMAIL,
            )

            const userEmailConfirmation =
                await this.userService.insertConfirmationEmailSSO({
                    userId: data.userId,
                    emailConfirmedAt,
                })
            const jwtToken = JwtUtils.generateJWTToken({
                code: userEmailConfirmation.id,
                secret: env.JWT_SECRET!,
                expiresIn: Number(env.TIME_EXPIRATION_CONFIRMED_EMAIL),
            })
            await this.emailService.sendInviteUserSSO({
                email: userData.email,
                code: jwtToken,
                expiresAt: userEmailConfirmation.emailExpiradedAt,
            })
        } else {
            await this.userService.inviteUserNoSSO(userData.email)
        }
        return true
    }

    async signOut(request: ISignOutRequest): Promise<void> {
        await this.authRepository.signOut(request)
    }

    async confirmationEmail({
        code,
    }: ConfirmationEmailRequest): Promise<boolean> {
        const codeDecoded = JwtUtils.verifyJWTToken({
            token: code,
            secret: env.JWT_SECRET!,
        })

        if (!codeDecoded) {
            return false
        }
        return await this.authRepository.confirmationEmailSSO({
            code: codeDecoded,
        })
    }

    async resetPassword(
        data: ResetPasswordRequest,
    ): Promise<ResetPasswordResponse> {
        if (
            env.SIGN_IN_METHOD !== LoginMethodType.BOTH &&
            env.SIGN_IN_METHOD !== LoginMethodType.REGULAR
        )
            throw new MethodNotAllowedException(
                'This login method is disabled, try using SSO method.',
            )

        let emailSendSuccess = false
        const userData = await this.userService.updatePassword(data)
        if (!userData?.email) {
            return {
                passwordReset: false,
                emailSend: emailSendSuccess,
            }
        }
        try {
            await this.emailService.sendPasswordResetConfirmation(
                userData.email,
            )
            emailSendSuccess = true
        } catch (error) {
            //Implement a logger service to log the error
            console.error('Email failure:', error)
        }
        return {
            passwordReset: true,
            emailSend: emailSendSuccess,
        }
    }

    async authenticate(
        logMetadata: ILogLoginUserData,
        authenticationUser: AuthenticationUserRequest,
    ): Promise<AuthUserResponse | null> {
        const { email, password } = authenticationUser
        try {
            const data = await this.authRepository.signInWithEmail(
                email,
                password,
            )
            if (!data) {
                return null
            }
            const userDecoded = JwtUtils.decodeJWTToken(
                data.session.access_token,
            ) as any

            const historyData = {
                action: ActionsType.LOGIN,
                success: true,
                email: userDecoded.email,
                user_id: userDecoded.user_id,
                description: 'user loggedin',
                profile: `id :${userDecoded.profile.access_id} | name: ${userDecoded.profile.access_name}`,
                metadata: {
                    user_login_status: StatusType.SUCCESS,
                    user_account_status: UserAccountStatus.UNLOCKED,
                    ...logMetadata,
                },
            }

            await this.loginHandle.handleSuccessfulLogin(
                data.user.id,
                historyData,
            )

            return {
                accessToken: data.session.access_token,
                refreshToken: data.session.refresh_token,
                user: data.user,
            }
        } catch (error) {
            await this.loginHandle.authenticationFailed(email, logMetadata)

            throw error
        }
    }

    // async authenticateWithMagicLink(email: string): Promise<boolean> {
    //     const isValidEmail =
    //         await this.authRepository.signInWithMagicLink(email)
    //     if (!isValidEmail) {
    //         return false
    //     }
    //     return true
    // }

    async refreshToken(
        refreshToken: string,
    ): Promise<RefreshTokenResponse | null> {
        const data = await this.authRepository.refreshToken(refreshToken)

        if (!data) {
            return null
        }

        const { session } = data
        return {
            accessToken: session.access_token,
            refreshToken: session.refresh_token,
        }
    }

    async resetPasswordForEmail(email: string): Promise<boolean> {
        if (
            env.SIGN_IN_METHOD !== LoginMethodType.BOTH &&
            env.SIGN_IN_METHOD !== LoginMethodType.REGULAR
        )
            throw new MethodNotAllowedException(
                'This login method is disabled, try using SSO method.',
            )

        return await this.authRepository.resetPasswordForEmail(email)
    }

    async getSSOUrl(domain?: string): Promise<{ url: string }> {
        if (
            env.SIGN_IN_METHOD !== LoginMethodType.BOTH &&
            env.SIGN_IN_METHOD !== LoginMethodType.SSO
        )
            throw new MethodNotAllowedException(
                'The SSO Login method is disabled, try using regular login method.',
            )

        if (!domain && !env.DEFAULT_DOMAIN_PROVIDER_SSO)
            throw new BadRequestException('Must provide the domain.')

        return this.authRepository.signInWithSSO(
            domain || env.DEFAULT_DOMAIN_PROVIDER_SSO || '',
        )
    }

    async resetPasswordForSubordinate(
        data: SubordinateResetPasswordRequest,
    ): Promise<boolean> {
        return await this.authRepository.resetPasswordForSubordinate(data)
    }

    async enrollMFA(data: MFAEnrollRequest): Promise<MFAEnrollResponse | null> {
        const response = await this.authRepository.enrollMFA(data)
        if (!response) {
            return null
        }
        return response
    }

    async verifyMFA(data: MFAVerifyRequest): Promise<MFAVerifyResponse | null> {
        const response = await this.authRepository.verifyMFA(data)
        if (!response) {
            return null
        }
        return response
    }

    async unenrollMFA(
        data: MFAUnenrollRequest,
    ): Promise<MFAUnenrollResponse | null> {
        const response = await this.authRepository.unenrollMFA(data)
        if (!response) {
            return null
        }
        return response
    }

    async challengeVerifyMFA(
        data: MFAChallengeVerifyRequest,
        { ipAddress, token }: ISupabaseHeadersRequest,
    ): Promise<MFAChallengeVerifyResponse | null> {
        const response = await this.authRepository.challengeVerifyMFA(data, {
            ipAddress,
            token,
        })
        if (!response) {
            return null
        }
        return response
    }

    async checkAuthenticatorAssuranceLevel(): Promise<AuthenticatorAssuranceLevelResponse | null> {
        const response =
            await this.authRepository.checkAuthenticatorAssuranceLevel()
        if (!response) {
            return null
        }
        return response
    }

    async createMFAChallenge(
        data: MFAChallengeRequest,
    ): Promise<MFAChallengeResponse | null> {
        const response = await this.authRepository.createMFAChallenge(data)
        if (!response) {
            return null
        }
        return response
    }

    async listMFAFactors(): Promise<MFAListResponse | null> {
        const response = await this.authRepository.listMFAFactors()
        if (!response) {
            return null
        }
        return response
    }

    async removeUnverifiedFactors(): Promise<MFARemoveUnverifiedFactorsResponse | null> {
        const response = await this.authRepository.removeUnverifiedFactors()
        if (!response) {
            return null
        }
        return response
    }
}
