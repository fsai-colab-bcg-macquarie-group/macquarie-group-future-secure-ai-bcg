import {
    ConfirmationEmailRequest,
    ISignOutRequest,
    ISupabaseHeadersRequest,
    MFAChallengeRequest,
    MFAChallengeVerifyRequest,
    MFAEnrollRequest,
    MFAUnenrollRequest,
    MFAVerifyRequest,
    SubordinateResetPasswordRequest,
} from 'src/domain/auth-layer/auth/request'
import {
    AuthenticatorAssuranceLevelResponse,
    AuthSessionResponse,
    MFAChallengeResponse,
    MFAChallengeVerifyResponse,
    MFAListResponse,
    MFAEnrollResponse,
    MFAUnenrollResponse,
    MFAVerifyResponse,
    MFARemoveUnverifiedFactorsResponse,
} from 'src/domain/auth-layer/auth/response'

export interface IAuthenticationRepository {
    signInWithEmail(
        email: string,
        password: string,
    ): Promise<AuthSessionResponse | null>

    // signInWithMagicLink(email: string): Promise<boolean>

    signInWithSSO(domain: string): Promise<{ url: string }>

    refreshToken(refreshToken: string): Promise<AuthSessionResponse | null>

    resetPasswordForEmail(email: string): Promise<boolean>

    signOut(request: ISignOutRequest): Promise<void>

    confirmationEmailSSO({ code }: ConfirmationEmailRequest): Promise<boolean>

    resetPasswordForSubordinate(
        data: SubordinateResetPasswordRequest,
    ): Promise<boolean>

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
