import { IAuthenticationRepository } from 'src/domain/interfaces/services/auth-layer/auth'
import { AuthenticationService } from './authentication-service'
import { LoginHandleService } from './login-handle-service'
import { IUserService } from 'src/domain/interfaces/services/auth-layer/users'
import { IEMailNotificationService } from 'src/shared/services/interfaces/notification/i-mail-notification-service'
import { FilterSelectUserResponse } from 'src/domain/auth-layer/user/response/filter-select-user-response'
import { formatExpirationTime } from 'src/utils'
import JwtUtils from 'src/utils/jwt-utils'
import { User } from '@supabase/supabase-js'
import { ResetPasswordRequest } from 'src/domain/auth-layer/auth/request/reset-password-request'
import { AuthenticationUserRequest } from 'src/domain/auth-layer/auth/request/authentication-user-request'
import { ILogLoginUserData } from 'src/repository/logger/auth-layer/auth/i-log-login-data'
import {
    AuthenticatorAssuranceLevelResponse,
    AuthSessionResponse,
    MFAChallengeResponse,
    MFAChallengeVerifyResponse,
    MFAEnrollResponse,
    MFAListResponse,
    MFARemoveUnverifiedFactorsResponse,
    MFAUnenrollResponse,
    MFAVerifyResponse,
} from 'src/domain/auth-layer/auth/response'
import {
    MFAChallengeRequest,
    MFAChallengeVerifyRequest,
    MFAEnrollRequest,
    MFAUnenrollRequest,
    MFAVerifyRequest,
} from 'src/domain/auth-layer/auth/request/mfa-request'
import { FactorType } from 'src/domain/auth-layer/auth/request/mfa-request'
import { ISupabaseHeadersRequest } from 'src/domain/auth-layer/auth/request'
import { ActionsType } from 'src/domain/auth-layer/auth/enum'
import { StatusType } from 'src/domain/auth-layer/auth/enum'
import { UserAccountStatus } from 'src/domain/auth-layer/auth/enum'
jest.mock('src/utils/jwt-utils', () => ({
    generateJWTToken: jest.fn(() => 'any-jwt-token'),
    verifyJWTToken: jest.fn(() => 'any-jwt-token'),
    decodeJWTToken: jest.fn(() => {
        return {
            profile: {
                access_id: 'any-access-id',
                access_name: 'any-access-name',
            },
            user_id: 'any-user-id',
            email: 'any-email',
        }
    }),
}))
jest.mock('src/utils', () => ({
    formatExpirationTime: jest.fn(() => 'any-date'),
}))

describe('AuthenticationService', () => {
    let authenticationService: AuthenticationService
    let mockAuthRepository: jest.Mocked<IAuthenticationRepository>
    let mockUserService: jest.Mocked<IUserService>
    let mockEmailService: jest.Mocked<IEMailNotificationService>
    let mockLoginHandleService: jest.Mocked<LoginHandleService>
    beforeEach(async () => {
        mockAuthRepository = {
            removeUnverifiedFactors: jest.fn(),
            signOut: jest.fn(),
            confirmationEmailSSO: jest.fn(),
            signInWithEmail: jest.fn(),
            refreshToken: jest.fn(),
            resetPasswordForEmail: jest.fn(),
            signInWithSSO: jest.fn(),
            resetPasswordForSubordinate: jest.fn(),
            enrollMFA: jest.fn(),
            verifyMFA: jest.fn(),
            unenrollMFA: jest.fn(),
            challengeVerifyMFA: jest.fn(),
            checkAuthenticatorAssuranceLevel: jest.fn(),
            createMFAChallenge: jest.fn(),
            listMFAFactors: jest.fn(),
        } as any
        mockUserService = {
            select: jest.fn(),
            insertConfirmationEmailSSO: jest.fn(),
            inviteUserNoSSO: jest.fn(),
            updatePassword: jest.fn(),
        } as any
        mockEmailService = {
            sendInviteUserSSO: jest.fn(),
            sendPasswordResetConfirmation: jest.fn(),
        } as any
        mockLoginHandleService = {
            authenticationFailed: jest.fn(),
            handleSuccessfulLogin: jest.fn(),
            handleFailedLogin: jest.fn(),
        } as any

        authenticationService = new AuthenticationService(
            mockAuthRepository,
            mockLoginHandleService,
            mockEmailService,
            mockUserService,
        )
    })
    const mockUserResponse: User = {
        id: 'b205864a-085d-403e-a1b9-13184ab6fc5a',
        aud: 'authenticated',
        role: 'authenticated',
        email: 'any-email',
        confirmed_at: '2024-11-28T20:36:35.470113Z',
        app_metadata: {
            provider: 'email',
            providers: ['email'],
        },
        user_metadata: {},
        identities: [],
        created_at: '2024-11-28T20:36:35.4639Z',
        updated_at: '2024-12-09T13:59:40.947371Z',
    }
    describe('generateActivateLink', () => {
        const mockSelectUserSSOResponse = (): FilterSelectUserResponse => ({
            id: '1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'any-email',
            location: {
                name: 'New York',
                id: '1',
            },
            access: {
                name: 'Admin',
                id: '1',
            },
            status: 'Activated',
            banned: false,
            provider: 'SSO',
            useCaseTeams: ['1', '2'],
        })
        it('should call userService.select with correct values', async () => {
            mockUserService.select.mockResolvedValue(null)
            await authenticationService.generateActivateLink({
                userId: '1',
                token: '1',
            })
            expect(mockUserService.select).toHaveBeenCalledWith({
                id: '1',
                token: '1',
            })
        })
        it('should return false when user is not found', async () => {
            mockUserService.select.mockResolvedValue(null)
            const result = await authenticationService.generateActivateLink({
                userId: '1',
                token: '1',
            })
            expect(result).toBeFalsy()
        })
        it('should rethrow error if userService.select throw', async () => {
            mockUserService.select.mockRejectedValue(new Error('Error'))
            const promise = authenticationService.generateActivateLink({
                userId: '1',
                token: '1',
            })
            expect(promise).rejects.toThrow(new Error('Error'))
        })
        it('should call with correct values userService.insertConfirmationEmailSSO when user is SSO found', async () => {
            ;(formatExpirationTime as jest.Mock).mockReturnValue('any-date')
            ;(JwtUtils.generateJWTToken as jest.Mock).mockReturnValue(
                'any-jwt-token',
            )
            mockUserService.select.mockResolvedValue(
                mockSelectUserSSOResponse(),
            )
            mockUserService.insertConfirmationEmailSSO.mockResolvedValue({
                id: '1',
                emailExpiradedAt: 'any-date',
            })
            mockEmailService.sendInviteUserSSO.mockResolvedValue()
            await authenticationService.generateActivateLink({
                userId: '1',
                token: '1',
            })
            const sut =
                mockUserService.insertConfirmationEmailSSO.mockResolvedValue({
                    id: '1',
                    emailExpiradedAt: 'any-date',
                })
            expect(sut).toHaveBeenCalledWith({
                userId: '1',
                emailConfirmedAt: 'any-date',
            })
        })

        it('should call userService.inviteUserNoSSO when user is not SSO found', async () => {
            mockUserService.select.mockResolvedValue({
                ...mockSelectUserSSOResponse(),
                provider: 'Email',
            })
            const sut =
                mockUserService.inviteUserNoSSO.mockResolvedValue(
                    mockUserResponse,
                )
            await authenticationService.generateActivateLink({
                userId: '1',
                token: '1',
            })
            expect(sut).toHaveBeenCalledWith('any-email')
            expect(mockEmailService.sendInviteUserSSO).not.toHaveBeenCalled()
        })
        it('should return true when generateActivateLink is successful', async () => {
            mockUserService.select.mockResolvedValue({
                ...mockSelectUserSSOResponse(),
                provider: 'Email',
            })
            const result = await authenticationService.generateActivateLink({
                userId: '1',
                token: '1',
            })
            expect(result).toBe(true)
        })
        it('should return false if userService.insertConfirmationEmailSSO throw', async () => {
            mockUserService.insertConfirmationEmailSSO.mockRejectedValue(
                new Error('Error'),
            )
            const sut = await authenticationService.generateActivateLink({
                userId: '1',
                token: '1',
            })
            expect(sut).toBeFalsy()
        })
        it('should return false if userService.inviteUserNoSSO throw', async () => {
            mockUserService.inviteUserNoSSO.mockRejectedValue(
                new Error('Error'),
            )
            const sut = await authenticationService.generateActivateLink({
                userId: '1',
                token: '1',
            })
            expect(sut).toBeFalsy()
        })
    })
    describe('signOut', () => {
        it('should call authRepository.signOut with correct values', async () => {
            const sut = mockAuthRepository.signOut.mockResolvedValue()
            await authenticationService.signOut({
                userId: '1',
                sessionId: '1',
            })
            expect(sut).toHaveBeenCalledWith({
                userId: '1',
                sessionId: '1',
            })
        })
        it('should rethrow error if authRepository.signOut throw', async () => {
            mockAuthRepository.signOut.mockRejectedValue(new Error('Error'))
            const promise = authenticationService.signOut({
                userId: '1',
                sessionId: '1',
            })
            expect(promise).rejects.toThrow(new Error('Error'))
        })
    })
    describe('confirmationEmail', () => {
        it('should call authRepository.confirmationEmail with correct values', async () => {
            const sut =
                mockAuthRepository.confirmationEmailSSO.mockResolvedValue(true)
            await authenticationService.confirmationEmail({
                code: 'any-jwt-token',
            })
            expect(sut).toHaveBeenCalledWith({
                code: 'any-jwt-token',
            })
        })
        it('should return false if JwtUtils.verifyJWTToken return null', async () => {
            ;(JwtUtils.verifyJWTToken as jest.Mock).mockReturnValue(null)
            const sut = await authenticationService.confirmationEmail({
                code: 'any-jwt-token',
            })
            expect(sut).toBeFalsy()
        })
        it('should return false if authRepository.confirmationEmailSSO return false', async () => {
            mockAuthRepository.confirmationEmailSSO.mockResolvedValueOnce(false)
            const sut = await authenticationService.confirmationEmail({
                code: 'any-jwt-token',
            })
            expect(sut).toBeFalsy()
        })
        it('should return true if authRepository.confirmationEmailSSO return true', async () => {
            ;(JwtUtils.verifyJWTToken as jest.Mock).mockReturnValue(
                'any-jwt-token',
            )
            mockAuthRepository.confirmationEmailSSO.mockResolvedValueOnce(true)
            const sut = await authenticationService.confirmationEmail({
                code: 'any-jwt-token',
            })
            expect(sut).toBe(true)
        })
        it('should rethrow error if authRepository.confirmationEmailSSO throw', async () => {
            mockAuthRepository.confirmationEmailSSO.mockRejectedValue(
                new Error('Error'),
            )
            const promise = authenticationService.confirmationEmail({
                code: 'any-jwt-token',
            })
            expect(promise).rejects.toThrow(new Error('Error'))
        })
        it('should throw error if JwtUtils.verifyJWTToken throw', async () => {
            ;(JwtUtils.verifyJWTToken as jest.Mock).mockImplementation(() => {
                throw new Error('JWT verification error')
            })
            const promise = authenticationService.confirmationEmail({
                code: 'any-jwt-token',
            })
            expect(promise).rejects.toThrow(new Error('JWT verification error'))
        })
    })
    describe('resetPassword', () => {
        const mockResetPasswordRequest: ResetPasswordRequest = {
            accessToken: 'any-jwt-token',
            refreshToken: 'any-jwt-token',
            password: 'new-password',
            confirmPassword: 'new-password',
        }
        it('should call userService.updatePassword with correct values', async () => {
            const sut =
                mockUserService.updatePassword.mockResolvedValue(
                    mockUserResponse,
                )
            await authenticationService.resetPassword(mockResetPasswordRequest)
            expect(sut).toHaveBeenCalledWith(mockResetPasswordRequest)
        })
        it('should return  emailSend: false and passwordReset: false if userService.updatePassword return null', async () => {
            mockUserService.updatePassword.mockResolvedValue(null)
            const sut = await authenticationService.resetPassword(
                mockResetPasswordRequest,
            )
            expect(sut).toEqual({
                emailSend: false,
                passwordReset: false,
            })
        })
        it('should return  emailSend: true and passwordReset: true if userService.updatePassword return user and emailService.sendPasswordResetConfirmation success', async () => {
            mockUserService.updatePassword.mockResolvedValue(mockUserResponse)
            mockEmailService.sendPasswordResetConfirmation.mockResolvedValue()
            const sut = await authenticationService.resetPassword(
                mockResetPasswordRequest,
            )
            expect(sut).toEqual({
                emailSend: true,
                passwordReset: true,
            })
        })
        it('should call emailService.sendPasswordResetConfirmation with correct values', async () => {
            mockUserService.updatePassword.mockResolvedValue(mockUserResponse)
            const sut =
                mockEmailService.sendPasswordResetConfirmation.mockResolvedValue()
            await authenticationService.resetPassword(mockResetPasswordRequest)

            expect(sut).toHaveBeenCalledWith(mockUserResponse.email)
        })
        it('should return  emailSend: false and passwordReset: true if userService.updatePassword return user and emailService.sendPasswordResetConfirmation throw', async () => {
            mockUserService.updatePassword.mockResolvedValue(mockUserResponse)
            mockEmailService.sendPasswordResetConfirmation.mockRejectedValue(
                new Error('Error'),
            )
            const sut = await authenticationService.resetPassword(
                mockResetPasswordRequest,
            )
            expect(sut).toEqual({
                emailSend: false,
                passwordReset: true,
            })
        })

        // it('should throw error if env.SIGN_IN_METHOD is SSO', async () => {
        //     jest.mock('src/config/env', () => ({
        //         env: {
        //             SIGN_IN_METHOD: LoginMethodType.SSO,
        //         },
        //     }))
        //     const promise = authenticationService.resetPassword(
        //         mockResetPasswordRequest,
        //     )
        //     expect(promise).toThrow(
        //         new MethodNotAllowedException(
        //             'This login method is disabled, try using SSO method.',
        //         ),
        //     )
        // })
        it('should rethrow error if userService.updatePassword throw', async () => {
            mockUserService.updatePassword.mockRejectedValue(new Error('Error'))
            const promise = authenticationService.resetPassword(
                mockResetPasswordRequest,
            )
            expect(promise).rejects.toThrow(new Error('Error'))
        })
    })
    describe('authenticate', () => {
        const mockLoginHeaders: ILogLoginUserData = {
            created_at: new Date(),
            email: 'any-email',
            ip: '127.0.0.1',
        }
        const mockHistoryData: any = {
            action: ActionsType.LOGIN,
            success: true,
            email: 'any-email',
            user_id: 'any-user-id',
            description: 'user loggedin',
            profile: 'id :any-access-id | name: any-access-name',
            metadata: {
                user_login_status: StatusType.SUCCESS,
                user_account_status: UserAccountStatus.UNLOCKED,
                ...mockLoginHeaders,
            },
        }
        const mockAuthenticationUserRequest: AuthenticationUserRequest = {
            email: 'any-email',
            password: 'new-password',
        }
        const mockAuthSessionResponse: AuthSessionResponse = {
            session: {
                access_token: 'any-jwt-token',
                refresh_token: 'any-jwt-token',
                expires_in: 3600,
                token_type: 'Bearer',
                user: mockUserResponse,
            },
            user: mockUserResponse,
        }
        it('should call authRepository.signInWithEmail with correct values', async () => {
            const sut = mockAuthRepository.signInWithEmail.mockResolvedValue(
                mockAuthSessionResponse,
            )
            await authenticationService.authenticate(
                mockHistoryData,
                mockAuthenticationUserRequest,
            )
            expect(sut).toHaveBeenCalledWith(
                mockAuthenticationUserRequest.email,
                mockAuthenticationUserRequest.password,
            )
        })
        it('should call loginHandle.handleSuccessfulLogin with correct values', async () => {
            mockAuthRepository.signInWithEmail.mockResolvedValue(
                mockAuthSessionResponse,
            )
            const sut =
                mockLoginHandleService.handleSuccessfulLogin.mockResolvedValue()
            await authenticationService.authenticate(
                mockLoginHeaders,
                mockAuthenticationUserRequest,
            )
            expect(sut).toHaveBeenCalledWith(
                mockAuthSessionResponse.user.id,
                mockHistoryData,
            )
        })
        it('should return null if authRepository.signInWithEmail return null', async () => {
            mockAuthRepository.signInWithEmail.mockResolvedValue(null)
            const sut = await authenticationService.authenticate(
                mockHistoryData,
                mockAuthenticationUserRequest,
            )
            expect(sut).toBeNull()
        })
        it('should return correct values if authRepository.signInWithEmail return success', async () => {
            mockAuthRepository.signInWithEmail.mockResolvedValue(
                mockAuthSessionResponse,
            )
            const sut = await authenticationService.authenticate(
                mockHistoryData,
                mockAuthenticationUserRequest,
            )
            expect(sut).toEqual({
                accessToken: mockAuthSessionResponse.session.access_token,
                refreshToken: mockAuthSessionResponse.session.refresh_token,
                user: mockAuthSessionResponse.user,
            })
        })
        it('should rethrow error if authRepository.signInWithEmail throw', async () => {
            mockAuthRepository.signInWithEmail.mockRejectedValue(
                new Error('Error'),
            )
            const promise = authenticationService.authenticate(
                mockHistoryData,
                mockAuthenticationUserRequest,
            )
            expect(promise).rejects.toThrow(new Error('Error'))
        })
        it('should call loginHandle.authenticatioFailed with correct values when signInWithEmail throw', async () => {
            mockAuthRepository.signInWithEmail.mockImplementationOnce(() => {
                throw new Error('Error')
            })
            const promise = authenticationService.authenticate(
                mockHistoryData,
                mockAuthenticationUserRequest,
            )
            expect(promise).rejects.toThrow(new Error('Error'))
            const sut =
                mockLoginHandleService.authenticationFailed.mockResolvedValue()

            expect(sut).toHaveBeenCalledWith(
                mockAuthenticationUserRequest.email,
                mockHistoryData,
            )
        })
    })
    describe('refreshToken', () => {
        const mockAuthSessionResponse: AuthSessionResponse = {
            session: {
                access_token: 'any-jwt-token',
                refresh_token: 'any-jwt-refresh-token',
                expires_in: 3600,
                token_type: 'Bearer',
                user: mockUserResponse,
            },
            user: mockUserResponse,
        }

        it('should call authRepository.refreshToken with correct values', async () => {
            const sut = mockAuthRepository.refreshToken.mockResolvedValue(
                mockAuthSessionResponse,
            )
            await authenticationService.refreshToken(
                mockAuthSessionResponse.session.refresh_token,
            )
            expect(sut).toHaveBeenCalledWith(
                mockAuthSessionResponse.session.refresh_token,
            )
        })
        it('should return null if authRepository.refreshToken return null', async () => {
            mockAuthRepository.refreshToken.mockResolvedValue(null)
            const sut = await authenticationService.refreshToken(
                mockAuthSessionResponse.session.refresh_token,
            )
            expect(sut).toBeNull()
        })
        it('should return correct values if authRepository.refreshToken return success', async () => {
            mockAuthRepository.refreshToken.mockResolvedValue(
                mockAuthSessionResponse,
            )
            const sut = await authenticationService.refreshToken(
                mockAuthSessionResponse.session.refresh_token,
            )
            expect(sut).toEqual({
                accessToken: mockAuthSessionResponse.session.access_token,
                refreshToken: mockAuthSessionResponse.session.refresh_token,
            })
        })
        it('should rethrow error if authRepository.refreshToken throw', async () => {
            mockAuthRepository.refreshToken.mockRejectedValue(
                new Error('Error'),
            )
            const promise = authenticationService.refreshToken(
                mockAuthSessionResponse.session.refresh_token,
            )
            expect(promise).rejects.toThrow(new Error('Error'))
        })
    })
    describe('resetPasswordForEmail', () => {
        it('should call authRepository.resetPasswordForEmail with correct values', async () => {
            const sut =
                mockAuthRepository.resetPasswordForEmail.mockResolvedValue(true)
            await authenticationService.resetPasswordForEmail('any-email')
            expect(sut).toHaveBeenCalledWith('any-email')
        })
        it('should return false if authRepository.resetPasswordForEmail return false', async () => {
            mockAuthRepository.resetPasswordForEmail.mockResolvedValue(false)
            const sut =
                await authenticationService.resetPasswordForEmail('any-email')
            expect(sut).toBeFalsy()
        })
        it('should rethrow error if authRepository.resetPasswordForEmail throw', async () => {
            mockAuthRepository.resetPasswordForEmail.mockRejectedValue(
                new Error('Error'),
            )
            const promise =
                authenticationService.resetPasswordForEmail('any-email')
            expect(promise).rejects.toThrow(new Error('Error'))
        })
    })
    describe('getSSOUrl', () => {
        it('should call authRepository.getSSOUrl with correct values', async () => {
            const sut = mockAuthRepository.signInWithSSO.mockResolvedValue({
                url: 'https://example.com',
            })
            await authenticationService.getSSOUrl('domain.test.com')
            expect(sut).toHaveBeenCalledWith('domain.test.com')
        })
        it('should return domain on success', async () => {
            mockAuthRepository.signInWithSSO.mockResolvedValue({
                url: 'https://example.com',
            })
            const sut = await authenticationService.getSSOUrl('domain.test.com')
            expect(sut).toEqual({
                url: 'https://example.com',
            })
        })
        it('should throw error if authRepository.getSSOUrl throw', async () => {
            mockAuthRepository.signInWithSSO.mockRejectedValue(
                new Error('Error'),
            )
            const promise = authenticationService.getSSOUrl('domain.test.com')
            expect(promise).rejects.toThrow(new Error('Error'))
        })
    })
    describe('resetPasswordForSubordinate', () => {
        it('should call authRepository.resetPasswordForSubordinate with correct values', async () => {
            const sut =
                mockAuthRepository.resetPasswordForSubordinate.mockResolvedValue(
                    true,
                )
            await authenticationService.resetPasswordForSubordinate({
                userId: '1',
                password: 'new-password',
            })
            expect(sut).toHaveBeenCalledWith({
                userId: '1',
                password: 'new-password',
            })
        })
        it('should return false if authRepository.resetPasswordForSubordinate return false', async () => {
            mockAuthRepository.resetPasswordForSubordinate.mockResolvedValue(
                false,
            )
            const sut = await authenticationService.resetPasswordForSubordinate(
                {
                    userId: '1',
                    password: 'new-password',
                },
            )
            expect(sut).toBeFalsy()
        })
        it('should rethrow error if authRepository.resetPasswordForSubordinate throw', async () => {
            mockAuthRepository.resetPasswordForSubordinate.mockRejectedValue(
                new Error('Error'),
            )
            const promise = authenticationService.resetPasswordForSubordinate({
                userId: '1',
                password: 'new-password',
            })
            expect(promise).rejects.toThrow(new Error('Error'))
        })
    })
    describe('enrollMFA', () => {
        const mockMFAEnrollResponse: MFAEnrollResponse = {
            id: '1',
            type: 'totp',
            totp: {
                qr_code: 'any-qr-code',
                secret: 'any-secret',
                uri: 'any-uri',
            },
        }
        const mockMFAEnrollRequest: MFAEnrollRequest = {
            factorType: FactorType.TOTP,
            friendlyName: 'any-friendly-name',
        }

        it('should call authRepository.enrollMFA with correct values', async () => {
            const sut = mockAuthRepository.enrollMFA.mockResolvedValue(
                mockMFAEnrollResponse,
            )
            await authenticationService.enrollMFA(mockMFAEnrollRequest)
            expect(sut).toHaveBeenCalledWith(mockMFAEnrollRequest)
        })
        it('should return null if authRepository.enrollMFA return null', async () => {
            mockAuthRepository.enrollMFA.mockResolvedValue(null)
            const sut =
                await authenticationService.enrollMFA(mockMFAEnrollRequest)
            expect(sut).toBeNull()
        })
        it('should return correct values if authRepository.enrollMFA return success', async () => {
            mockAuthRepository.enrollMFA.mockResolvedValue(
                mockMFAEnrollResponse,
            )
            const sut =
                await authenticationService.enrollMFA(mockMFAEnrollRequest)
            expect(sut).toEqual(mockMFAEnrollResponse)
        })
        it('should rethrow error if authRepository.enrollMFA throw', async () => {
            mockAuthRepository.enrollMFA.mockRejectedValue(new Error('Error'))
            const promise =
                authenticationService.enrollMFA(mockMFAEnrollRequest)
            expect(promise).rejects.toThrow(new Error('Error'))
        })
    })
    describe('verifyMFA', () => {
        const mockMFAVerifyResponse: MFAVerifyResponse = {
            access_token: 'any-access-token',
            token_type: 'Bearer',
            expires_in: 3600,
            refresh_token: 'any-refresh-token',
            user: mockUserResponse,
        }
        const mockMFAVerifyRequest: MFAVerifyRequest = {
            factorId: '1',
            challengeId: '1',
            code: '123456',
        }
        it('should call authRepository.verifyMFA with correct values', async () => {
            const sut = mockAuthRepository.verifyMFA.mockResolvedValue(
                mockMFAVerifyResponse,
            )
            await authenticationService.verifyMFA(mockMFAVerifyRequest)
            expect(sut).toHaveBeenCalledWith(mockMFAVerifyRequest)
        })
        it('should return null if authRepository.verifyMFA return null', async () => {
            mockAuthRepository.verifyMFA.mockResolvedValue(null)
            const sut =
                await authenticationService.verifyMFA(mockMFAVerifyRequest)
            expect(sut).toBeNull()
        })
        it('should return correct values if authRepository.verifyMFA return success', async () => {
            mockAuthRepository.verifyMFA.mockResolvedValue(
                mockMFAVerifyResponse,
            )
            const sut =
                await authenticationService.verifyMFA(mockMFAVerifyRequest)
            expect(sut).toEqual(mockMFAVerifyResponse)
        })
        it('should rethrow error if authRepository.verifyMFA throw', async () => {
            mockAuthRepository.verifyMFA.mockRejectedValue(new Error('Error'))
            const promise =
                authenticationService.verifyMFA(mockMFAVerifyRequest)
            expect(promise).rejects.toThrow(new Error('Error'))
        })
    })
    describe('unenrollMFA', () => {
        const mockMFAUnenrollResponse: MFAUnenrollResponse = {
            id: '1',
        }
        const mockMFAUnenrollRequest: MFAUnenrollRequest = {
            factorId: '1',
        }
        it('should call authRepository.unenrollMFA with correct values', async () => {
            const sut = mockAuthRepository.unenrollMFA.mockResolvedValue(
                mockMFAUnenrollResponse,
            )
            await authenticationService.unenrollMFA(mockMFAUnenrollRequest)
            expect(sut).toHaveBeenCalledWith(mockMFAUnenrollRequest)
        })
        it('should return null if authRepository.unenrollMFA return null', async () => {
            mockAuthRepository.unenrollMFA.mockResolvedValue(null)
            const sut = await authenticationService.unenrollMFA(
                mockMFAUnenrollRequest,
            )
            expect(sut).toBeNull()
        })
        it('should return correct values if authRepository.unenrollMFA return success', async () => {
            mockAuthRepository.unenrollMFA.mockResolvedValue(
                mockMFAUnenrollResponse,
            )
            const sut = await authenticationService.unenrollMFA(
                mockMFAUnenrollRequest,
            )
            expect(sut).toEqual(mockMFAUnenrollResponse)
        })
        it('should rethrow error if authRepository.unenrollMFA throw', async () => {
            mockAuthRepository.unenrollMFA.mockRejectedValue(new Error('Error'))
            const promise = authenticationService.unenrollMFA(
                mockMFAUnenrollRequest,
            )
            expect(promise).rejects.toThrow(new Error('Error'))
        })
    })
    describe('challengeVerifyMFA', () => {
        const mockMFAChallengeVerifyResponse: MFAChallengeVerifyResponse = {
            access_token: 'any-access-token',
            token_type: 'Bearer',
            expires_in: 3600,
            refresh_token: 'any-refresh-token',
            user: mockUserResponse,
        }
        const mockMFAChallengeVerifyRequest: MFAChallengeVerifyRequest = {
            factorId: '1',
            code: '123456',
        }
        const mockSupabaseHeaders: ISupabaseHeadersRequest = {
            ipAddress: '127.0.0.1',
            token: 'mock-token',
        }
        it('should call authRepository.challengeVerifyMFA with correct values', async () => {
            const sut = mockAuthRepository.challengeVerifyMFA.mockResolvedValue(
                mockMFAChallengeVerifyResponse,
            )
            await authenticationService.challengeVerifyMFA(
                mockMFAChallengeVerifyRequest,
                mockSupabaseHeaders,
            )
            expect(sut).toHaveBeenCalledWith(
                mockMFAChallengeVerifyRequest,
                mockSupabaseHeaders,
            )
        })
        it('should return null if authRepository.challengeVerifyMFA return null', async () => {
            mockAuthRepository.challengeVerifyMFA.mockResolvedValue(null)
            const sut = await authenticationService.challengeVerifyMFA(
                mockMFAChallengeVerifyRequest,
                mockSupabaseHeaders,
            )
            expect(sut).toBeNull()
        })
        it('should return correct values if authRepository.challengeVerifyMFA return success', async () => {
            mockAuthRepository.challengeVerifyMFA.mockResolvedValue(
                mockMFAChallengeVerifyResponse,
            )
            const sut = await authenticationService.challengeVerifyMFA(
                mockMFAChallengeVerifyRequest,
                mockSupabaseHeaders,
            )
            expect(sut).toEqual(mockMFAChallengeVerifyResponse)
        })
        it('should rethrow error if authRepository.challengeVerifyMFA throw', async () => {
            mockAuthRepository.challengeVerifyMFA.mockRejectedValue(
                new Error('Error'),
            )
            const promise = authenticationService.challengeVerifyMFA(
                mockMFAChallengeVerifyRequest,
                mockSupabaseHeaders,
            )
            expect(promise).rejects.toThrow(new Error('Error'))
        })
    })
    describe('checkAuthenticatorAssuranceLevel', () => {
        const mockAuthenticatorAssuranceLevelResponse: AuthenticatorAssuranceLevelResponse =
            {
                currentLevel: 'any-current-level',
                nextLevel: 'any-next-level',
                currentAuthenticationMethods: [],
            }
        it('should call authRepository.checkAuthenticatorAssuranceLevel with correct values', async () => {
            const sut =
                mockAuthRepository.checkAuthenticatorAssuranceLevel.mockResolvedValue(
                    mockAuthenticatorAssuranceLevelResponse,
                )

            await authenticationService.checkAuthenticatorAssuranceLevel()
            expect(sut).toHaveBeenCalled()
        })
        it('should return null if authRepository.checkAuthenticatorAssuranceLevel return null', async () => {
            mockAuthRepository.checkAuthenticatorAssuranceLevel.mockResolvedValue(
                null,
            )
            const sut =
                await authenticationService.checkAuthenticatorAssuranceLevel()
            expect(sut).toBeNull()
        })
        it('should return correct values if authRepository.checkAuthenticatorAssuranceLevel return success', async () => {
            mockAuthRepository.checkAuthenticatorAssuranceLevel.mockResolvedValue(
                mockAuthenticatorAssuranceLevelResponse,
            )
            const sut =
                await authenticationService.checkAuthenticatorAssuranceLevel()
            expect(sut).toEqual(mockAuthenticatorAssuranceLevelResponse)
        })
        it('should rethrow error if authRepository.checkAuthenticatorAssuranceLevel throw', async () => {
            mockAuthRepository.checkAuthenticatorAssuranceLevel.mockRejectedValue(
                new Error('Error'),
            )
            const promise =
                authenticationService.checkAuthenticatorAssuranceLevel()
            expect(promise).rejects.toThrow(new Error('Error'))
        })
    })
    describe('createMFAChallenge', () => {
        const mockMFAChallengeResponse: MFAChallengeResponse = {
            id: '1',
            type: 'totp',
            expires_at: 1234567890,
        }
        const mockMFAChallengeRequest: MFAChallengeRequest = {
            factorId: '1',
        }
        it('should call authRepository.createMFAChallenge with correct values', async () => {
            const sut = mockAuthRepository.createMFAChallenge.mockResolvedValue(
                mockMFAChallengeResponse,
            )
            await authenticationService.createMFAChallenge(
                mockMFAChallengeRequest,
            )
            expect(sut).toHaveBeenCalledWith(mockMFAChallengeRequest)
        })
        it('should return null if authRepository.createMFAChallenge return null', async () => {
            mockAuthRepository.createMFAChallenge.mockResolvedValue(null)
            const sut = await authenticationService.createMFAChallenge(
                mockMFAChallengeRequest,
            )
            expect(sut).toBeNull()
        })
        it('should return correct values if authRepository.createMFAChallenge return success', async () => {
            mockAuthRepository.createMFAChallenge.mockResolvedValue(
                mockMFAChallengeResponse,
            )
            const sut = await authenticationService.createMFAChallenge(
                mockMFAChallengeRequest,
            )
            expect(sut).toEqual(mockMFAChallengeResponse)
        })
        it('should rethrow error if authRepository.createMFAChallenge throw', async () => {
            mockAuthRepository.createMFAChallenge.mockRejectedValue(
                new Error('Error'),
            )
            const promise = authenticationService.createMFAChallenge(
                mockMFAChallengeRequest,
            )
            expect(promise).rejects.toThrow(new Error('Error'))
        })
    })
    describe('listMFAFactors', () => {
        const mockMFAListResponse: MFAListResponse = {
            all: [],
            totp: [],
            phone: [],
        }
        it('should call authRepository.listMFAFactors with correct values', async () => {
            const sut =
                mockAuthRepository.listMFAFactors.mockResolvedValue(
                    mockMFAListResponse,
                )
            await authenticationService.listMFAFactors()
            expect(sut).toHaveBeenCalled()
        })
        it('should return null if authRepository.listMFAFactors return null', async () => {
            mockAuthRepository.listMFAFactors.mockResolvedValue(null)
            const sut = await authenticationService.listMFAFactors()
            expect(sut).toBeNull()
        })
        it('should return correct values if authRepository.listMFAFactors return success', async () => {
            mockAuthRepository.listMFAFactors.mockResolvedValue(
                mockMFAListResponse,
            )
            const sut = await authenticationService.listMFAFactors()
            expect(sut).toEqual(mockMFAListResponse)
        })
        it('should rethrow error if authRepository.listMFAFactors throw', async () => {
            mockAuthRepository.listMFAFactors.mockRejectedValue(
                new Error('Error'),
            )
            const promise = authenticationService.listMFAFactors()
            expect(promise).rejects.toThrow(new Error('Error'))
        })
    })
    describe('removeUnverifiedFactors', () => {
        const mockMFARemoveUnverifiedFactorsResponse: MFARemoveUnverifiedFactorsResponse =
            {
                success: true,
                message: 'any-message',
            }
        it('should call authRepository.removeUnverifiedFactors with correct values', async () => {
            const sut =
                mockAuthRepository.removeUnverifiedFactors.mockResolvedValue(
                    mockMFARemoveUnverifiedFactorsResponse,
                )
            await authenticationService.removeUnverifiedFactors()
            expect(sut).toHaveBeenCalled()
        })
        it('should return null if authRepository.removeUnverifiedFactors return null', async () => {
            mockAuthRepository.removeUnverifiedFactors.mockResolvedValue(null)
            const sut = await authenticationService.removeUnverifiedFactors()
            expect(sut).toBeNull()
        })
        it('should return correct values if authRepository.removeUnverifiedFactors return success', async () => {
            mockAuthRepository.removeUnverifiedFactors.mockResolvedValue(
                mockMFARemoveUnverifiedFactorsResponse,
            )
            const sut = await authenticationService.removeUnverifiedFactors()
            expect(sut).toEqual(mockMFARemoveUnverifiedFactorsResponse)
        })
        it('should rethrow error if authRepository.removeUnverifiedFactors throw', async () => {
            mockAuthRepository.removeUnverifiedFactors.mockRejectedValue(
                new Error('Error'),
            )
            const promise = authenticationService.removeUnverifiedFactors()
            expect(promise).rejects.toThrow(new Error('Error'))
        })
    })
})
