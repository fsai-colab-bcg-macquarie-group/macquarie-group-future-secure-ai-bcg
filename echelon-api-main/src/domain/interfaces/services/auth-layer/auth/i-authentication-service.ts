import {
    AuthenticationUserRequest,
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
import { ILogLoginUserData } from 'src/repository/logger/auth-layer/auth/i-log-login-data'

export interface IAuthenticationService {
    authenticate(
        logMetadata: ILogLoginUserData,
        authenticationUser: AuthenticationUserRequest,
    ): Promise<AuthUserResponse | null>

    // authenticateWithMagicLink(email: string): Promise<boolean>

    refreshToken(refreshToken: string): Promise<RefreshTokenResponse | null>

    resetPasswordForEmail(email: string): Promise<boolean>
    resetPassword(data: ResetPasswordRequest): Promise<ResetPasswordResponse>
    getSSOUrl(domain?: string): Promise<{ url: string }>
    resetPasswordForSubordinate(
        data: SubordinateResetPasswordRequest,
    ): Promise<boolean>
    confirmationEmail({ code }: ConfirmationEmailRequest): Promise<boolean>
    generateActivateLink(data: GenerateActivateLinkRequest): Promise<boolean>

    signOut(request: ISignOutRequest): Promise<void>

    // MFA Methods
    enrollMFA(data: MFAEnrollRequest): Promise<MFAEnrollResponse | null>
    verifyMFA(data: MFAVerifyRequest): Promise<MFAVerifyResponse | null>
    unenrollMFA(data: MFAUnenrollRequest): Promise<MFAUnenrollResponse | null>
    challengeVerifyMFA(
        data: MFAChallengeVerifyRequest,
        { ipAddress, token }: ISupabaseHeadersRequest,
    ): Promise<MFAChallengeVerifyResponse | null>
    checkAuthenticatorAssuranceLevel(): Promise<AuthenticatorAssuranceLevelResponse | null>
    createMFAChallenge(
        data: MFAChallengeRequest,
    ): Promise<MFAChallengeResponse | null>
    listMFAFactors(): Promise<MFAListResponse | null>
    removeUnverifiedFactors(): Promise<MFARemoveUnverifiedFactorsResponse | null>
}
