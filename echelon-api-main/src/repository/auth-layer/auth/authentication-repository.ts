import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { env } from 'src/config/env'
import {
    ConfirmationEmailRequest,
    ISignOutRequest,
    ISupabaseHeadersRequest,
    MFAChallengeRequest,
    MFAChallengeVerifyRequest,
    MFAEnrollRequest,
    MFAUnenrollRequest,
    MFAVerifyRequest,
} from 'src/domain/auth-layer/auth/request'
import { SubordinateResetPasswordRequest } from 'src/domain/auth-layer/auth/request/subordinate-reset-password'
import {
    AuthenticatorAssuranceLevelResponse,
    MFAChallengeResponse,
    AuthSessionResponse,
    MFAChallengeVerifyResponse,
    MFAEnrollResponse,
    MFAUnenrollResponse,
    MFAVerifyResponse,
    MFAListResponse,
    MFARemoveUnverifiedFactorsResponse,
} from 'src/domain/auth-layer/auth/response'
import { IAuthenticationRepository } from 'src/domain/interfaces/services/auth-layer/auth'
import { throwHttpException } from 'src/utils'

@Injectable()
export class AuthenticationRepository implements IAuthenticationRepository {
    private supabase: SupabaseClient

    constructor() {
        this.supabase = createClient(
            env.SUPABASE_URL || '',
            env.SUPABASE_SERVICE_ROLE_KEY || '',
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false,
                },
            },
        )
    }

    async confirmationEmailSSO({
        code,
    }: ConfirmationEmailRequest): Promise<boolean> {
        const { data, error } = await this.supabase
            .schema('auth_layer')
            .from('confirmation_email_sso')
            .select('email_expiraded_at, email_is_active, user_id')
            .eq('id', code)
            .single()

        if (error) {
            throwHttpException(error.message, error.code)
        }

        if (!data?.email_expiraded_at) {
            return false
        }

        const emailConfirmedAt = new Date(data.email_expiraded_at)
        const now = new Date()
        if (
            this.isEmailConfirmationValid(
                emailConfirmedAt,
                now,
                data.email_is_active,
            )
        ) {
            await this.activateEmailAndUnbanUser(code, data.user_id)
            return true
        }
        return false
    }

    private isEmailConfirmationValid(
        emailConfirmedAt: Date,
        now: Date,
        emailIsActive: boolean,
    ): boolean {
        return emailConfirmedAt > now && emailIsActive === false
    }

    private async activateEmailAndUnbanUser(
        code: string,
        userId: string,
    ): Promise<void> {
        const { error: updateError } = await this.supabase
            .schema('auth_layer')
            .from('confirmation_email_sso')
            .update({ email_is_active: true })
            .eq('id', code)
        if (updateError) {
            throwHttpException(updateError.message, updateError.code)
        }
        const { error: unbanError } = await this.supabase
            .schema('auth_layer')
            .rpc('unban_user_sso', {
                user_id: userId,
            })
        if (unbanError) {
            throwHttpException(unbanError.message, unbanError.code)
        }
    }

    async signInWithEmail(
        email: string,
        password: string,
    ): Promise<AuthSessionResponse | null> {
        const { data, error } = await this.supabase.auth.signInWithPassword({
            email,
            password,
        })
        if (error) {
            throwHttpException(error.message, error.code, error.status)
        }
        if (!data?.user || !data?.session) {
            return null
        }
        const { user, session } = data
        return { user, session }
    }

    // async signInWithMagicLink(email: string): Promise<boolean> {
    //     const {
    //         data: { user, session },
    //         error,
    //     } = await this.supabase.auth.signInWithOtp({
    //         email,
    //         options: {
    //             emailRedirectTo: `${env.SITE_URL}/third-party`,
    //         },
    //     })
    //     if (error) {
    //         throwHttpException(error.message, error.code, error.status)
    //     }

    //     return true
    // }

    async signInWithSSO(domain: string) {
        const { data, error } = await this.supabase.auth.signInWithSSO({
            domain,
            options: {
                redirectTo: `${env.SITE_URL}/third-party`,
            },
        })

        if (error) {
            throwHttpException(error.message, error.code, error.status)
        }
        return { url: data.url }
    }

    async refreshToken(
        refreshToken: string,
    ): Promise<AuthSessionResponse | null> {
        const { data, error } = await this.supabase.auth.refreshSession({
            refresh_token: refreshToken,
        })
        if (error) {
            throw new HttpException(
                {
                    statusCode: error.status,
                    message: error.message,
                    error: error.code,
                },
                error.status || HttpStatus.BAD_REQUEST,
            )
        }

        if (!data?.user || !data?.session) {
            return null
        }
        const { user, session } = data
        return { user, session }
    }

    async resetPasswordForEmail(email: string): Promise<boolean> {
        const { data, error } = await this.supabase.auth.resetPasswordForEmail(
            email,
            {
                redirectTo: `${env.SITE_URL}/third-party`,
            },
        )
        if (error) {
            throwHttpException(error.message, error.code)
        }
        if (!data) {
            return false
        }
        return true
    }

    async resetPasswordForSubordinate(
        requestData: SubordinateResetPasswordRequest,
    ): Promise<boolean> {
        const { error } = await this.supabase
            .schema('auth_layer')
            .rpc('reset_password', {
                user_id: requestData.userId,
                new_password: requestData.password,
            })

        if (error) {
            throwHttpException(error.message, error.code)
        }

        return true
    }

    async signOut({ sessionId, userId }: ISignOutRequest) {
        const { error: errorDeleteRefreshToken } = await this.supabase
            .schema('auth')
            .from('refresh_tokens')
            .delete()
            .match({
                user_id: userId,
                session_id: sessionId,
                revoked: false,
            })
            .is('parent', null)

        const { error: errorSignOut } = await this.supabase.auth.signOut()
        if (errorSignOut) {
            throwHttpException(errorSignOut.message, errorSignOut.code)
        }
        if (errorDeleteRefreshToken) {
            throwHttpException(
                errorDeleteRefreshToken.message,
                errorDeleteRefreshToken.code,
            )
        }
    }

    async handleFailedLogin(userId: string): Promise<number> {
        const lockduration = env.FAILED_LOGIN_LOCK_DURATION
        const maxattempts = env.MAX_FAILED_LOGIN_ATTEMPTS
        const { data: remainingTime } = await this.supabase
            .schema('auth_layer')
            .rpc('check_user_lockout', {
                userid: userId,
            })
        if (!remainingTime) {
            const { data: attempts } = await this.supabase
                .schema('auth_layer')
                .rpc('handle_failed_login', {
                    lockduration,
                    maxattempts,
                    userid: userId,
                })
            if (attempts === Number(maxattempts) + 1) {
                throwHttpException(
                    `Your account is locked due to too many failed login attempts. Please try again after ${env.FAILED_LOGIN_LOCK_DURATION}`,
                    HttpStatus.TOO_MANY_REQUESTS,
                    HttpStatus.TOO_MANY_REQUESTS,
                )
            }
        }

        return remainingTime
    }

    async handleSuccessfulLogin(userId: string): Promise<void> {
        await this.supabase
            .schema('auth_layer')
            .rpc('reset_failed_attempts_if_exists', {
                userid: userId,
            })
    }

    async enrollMFA(data: MFAEnrollRequest): Promise<MFAEnrollResponse | null> {
        const { data: mfaData, error } = await this.supabase.auth.mfa.enroll({
            factorType: data.factorType as 'totp',
            friendlyName: data.friendlyName,
        })

        if (error) {
            throwHttpException(error.message, error.code, error.status)
        }
        if (!mfaData) {
            return null
        }

        return {
            id: mfaData.id,
            type: 'totp',
            totp: {
                qr_code: mfaData.totp.qr_code,
                secret: mfaData.totp.secret,
                uri: mfaData.totp.uri,
            },
            friendly_name: mfaData.friendly_name,
        }
    }

    async verifyMFA(data: MFAVerifyRequest): Promise<MFAVerifyResponse | null> {
        const { data: mfaData, error } = await this.supabase.auth.mfa.verify({
            factorId: data.factorId,
            challengeId: data.challengeId,
            code: data.code,
        })

        if (error) {
            throwHttpException(error.message, error.code, error.status)
        }
        if (!mfaData) {
            return null
        }

        return {
            access_token: mfaData.access_token,
            token_type: mfaData.token_type,
            expires_in: mfaData.expires_in,
            refresh_token: mfaData.refresh_token,
            user: mfaData.user,
        }
    }

    async unenrollMFA(
        data: MFAUnenrollRequest,
    ): Promise<MFAUnenrollResponse | null> {
        const { data: unenrollData, error } =
            await this.supabase.auth.mfa.unenroll({
                factorId: data.factorId,
            })

        if (error) {
            throwHttpException(error.message, error.code, error.status)
        }

        if (!unenrollData) {
            return null
        }

        return {
            id: unenrollData.id,
        }
    }

    async checkAuthenticatorAssuranceLevel(): Promise<AuthenticatorAssuranceLevelResponse | null> {
        const { data, error } =
            await this.supabase.auth.mfa.getAuthenticatorAssuranceLevel()

        if (error) {
            throwHttpException(error.message, error.code, error.status)
        }

        if (!data?.currentLevel || !data?.nextLevel) {
            return null
        }

        return {
            currentLevel: data.currentLevel,
            nextLevel: data.nextLevel,
            currentAuthenticationMethods: data.currentAuthenticationMethods,
        }
    }

    async challengeVerifyMFA(
        data: MFAChallengeVerifyRequest,
        { ipAddress, token }: ISupabaseHeadersRequest,
    ): Promise<MFAChallengeVerifyResponse | null> {
        console.log('ipAddress challengeVerifyMFA', ipAddress)
        const supabase = createClient(
            env.SUPABASE_URL || '',
            env.SUPABASE_SERVICE_ROLE_KEY || '',
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false,
                },
                global: {
                    headers: {
                        'X-Forwarded-For': ipAddress,
                        Authorization: `Bearer ${token}`,
                    },
                },
            },
        )
        const { data: mfaData, error } =
            await supabase.auth.mfa.challengeAndVerify({
                factorId: data.factorId,
                code: data.code,
            })

        if (error) {
            throwHttpException(error.message, error.code, error.status)
        }

        if (!mfaData) {
            return null
        }

        return {
            access_token: mfaData.access_token,
            token_type: mfaData.token_type,
            expires_in: mfaData.expires_in,
            refresh_token: mfaData.refresh_token,
            user: mfaData.user,
        }
    }

    async createMFAChallenge(
        data: MFAChallengeRequest,
    ): Promise<MFAChallengeResponse | null> {
        const { data: mfaData, error } = await this.supabase.auth.mfa.challenge(
            {
                factorId: data.factorId,
            },
        )

        if (error) {
            throwHttpException(error.message, error.code, error.status)
        }

        if (!mfaData) {
            return null
        }

        return {
            id: mfaData.id,
            type: mfaData.type,
            expires_at: mfaData.expires_at,
        }
    }

    async removeUnverifiedFactors(): Promise<MFARemoveUnverifiedFactorsResponse> {
        const allFactors = await this.listMFAFactors()

        if (!allFactors?.all?.length) {
            return {
                success: false,
                message: 'No unverified factors found',
            }
        }

        const unverifiedFactors = allFactors.all.filter(
            (factor) => factor.status === 'unverified',
        )

        for (const factor of unverifiedFactors) {
            await this.unenrollMFA({ factorId: factor.id })
        }

        return {
            success: true,
            message: 'Unverified factors removed successfully',
        }
    }

    async listMFAFactors(): Promise<MFAListResponse | null> {
        const { data, error } = await this.supabase.auth.mfa.listFactors()

        if (error) {
            throwHttpException(error.message, error.code, error.status)
        }

        if (!data) {
            return null
        }

        return {
            all: data.all,
            totp: data.totp,
            phone: data.phone,
        }
    }
}
