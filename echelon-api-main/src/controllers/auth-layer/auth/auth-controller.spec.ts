import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { User } from '@supabase/supabase-js'
import {
    AuthenticationUserRequest,
    FactorType,
    ISupabaseHeadersRequest,
    MFAChallengeRequest,
    MFAChallengeVerifyRequest,
    MFAEnrollRequest,
    MFAUnenrollRequest,
    MFAVerifyRequest,
    ResetPasswordRequest,
} from 'src/domain/auth-layer/auth/request'
import {
    AuthUserResponse,
    MFAChallengeResponse,
    MFAChallengeVerifyResponse,
    MFAEnrollResponse,
    RefreshTokenResponse,
    ResetPasswordResponse,
    AuthenticatorAssuranceLevelResponse,
    MFAListResponse,
    MFARemoveUnverifiedFactorsResponse,
    MFAUnenrollResponse,
    MFAVerifyResponse,
} from 'src/domain/auth-layer/auth/response'
import { IAuthenticationService } from 'src/domain/interfaces/services/auth-layer/auth'
import { IUserService } from 'src/domain/interfaces/services/auth-layer/users'
import { AuthController } from './auth-controller'
import { JwtService } from '@nestjs/jwt'
import { Reflector } from '@nestjs/core'
import { IAuthCustomRequest } from 'src/controllers/http-helpers'
import { ILoggerService } from 'src/shared/services/interfaces/i-logger-service'
import { IHistoryService } from 'src/services/auth-layer/history/i-history-service'
describe('AuthController', () => {
    let authController: AuthController
    let mockAuthService: jest.Mocked<IAuthenticationService>
    let mockUserService: jest.Mocked<IUserService>
    let mockLoggerService: jest.Mocked<ILoggerService>
    let mockHistoryService: jest.Mocked<IHistoryService>

    beforeEach(async () => {
        mockAuthService = {
            authenticate: jest.fn(),
            authenticateWithMagicLink: jest.fn(),
            refreshToken: jest.fn(),
            resetPasswordForEmail: jest.fn(),
            resetPassword: jest.fn(),
            getSSOUrl: jest.fn(),
            confirmationEmail: jest.fn(),
            generateActivateLink: jest.fn(),
            enrollMFA: jest.fn(),
            verifyMFA: jest.fn(),
            unenrollMFA: jest.fn(),
            createMFAChallenge: jest.fn(),
            challengeVerifyMFA: jest.fn(),
            checkAuthenticatorAssuranceLevel: jest.fn(),
            listMFAFactors: jest.fn(),
            removeUnverifiedFactors: jest.fn(),
            resetPasswordForSubordinate: jest.fn(),
            signOut: jest.fn(),
        } as any

        mockUserService = {
            selectByEmail: jest.fn(),
        } as any

        mockLoggerService = {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
        } as any

        mockHistoryService = {
            createHistory: jest.fn(),
        } as any

        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: 'IAuthenticationService',
                    useValue: mockAuthService,
                },
                { provide: 'IUserService', useValue: mockUserService },
                {
                    provide: JwtService,
                    useValue: {
                        verifyAsync: jest.fn(),
                    },
                },
                {
                    provide: Reflector,
                    useValue: {
                        get: jest.fn(),
                    },
                },
                {
                    provide: 'ILoggerService',
                    useValue: mockLoggerService,
                },
                {
                    provide: 'IHistoryService',
                    useValue: mockHistoryService,
                },
            ],
            exports: ['IAuthenticationService'],
        }).compile()

        authController = module.get<AuthController>(AuthController)
    })

    describe('healthCheck', () => {
        it('should return 200 status code', async () => {
            const response = await authController.healthCheck()
            expect(response.statusCode).toBe(200)
        })
    })

    describe('login', () => {
        const mockUserResponse: User = {
            id: 'b205864a-085d-403e-a1b9-13184ab6fc5a',
            aud: 'authenticated',
            role: 'authenticated',
            email: 'john.doe@example.com',
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

        const mockHeaderRequest = {
            ip: '127.0.0.1',
            headers: {
                'x-forwarded-for': '192.168.1.1',
                'user-agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
            connection: {
                remoteAddress: '10.0.0.1',
            },
        }

        const mockLoginData: AuthenticationUserRequest = {
            email: 'test@example.com',
            password: 'ValidPassword123!',
        }

        const mockLoginResponse: AuthUserResponse = {
            user: mockUserResponse,
            accessToken: 'accessToken',
            refreshToken: 'refreshToken',
        }

        it('should call authService.authenticate with correct values', async () => {
            const sut =
                mockAuthService.authenticate.mockResolvedValue(
                    mockLoginResponse,
                )

            await authController.login(mockHeaderRequest, mockLoginData)
            expect(sut).toHaveBeenCalledWith(
                {
                    ip: mockHeaderRequest.ip,
                    device: mockHeaderRequest.headers['user-agent'],
                    browser: mockHeaderRequest.headers['user-agent'],
                },
                mockLoginData,
            )
        })

        it('should return data response and status 200 when login success', async () => {
            mockAuthService.authenticate.mockResolvedValue(mockLoginResponse)
            const response = await authController.login(
                mockHeaderRequest,
                mockLoginData,
            )
            expect(response.statusCode).toBe(200)
            expect(response.data).toEqual({
                user: mockLoginResponse.user,
                accessToken: mockLoginResponse.accessToken,
                refreshToken: mockLoginResponse.refreshToken,
            })
        })
        it('should throw HttpException when invalid login is provider', async () => {
            const mockLoginData: AuthenticationUserRequest = {
                email: 'test@example.com',
                password: 'InvalidPassword!',
            }

            mockAuthService.authenticate.mockRejectedValue(
                new HttpException(
                    'An unexpected error occurred. Please try again later.',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                ),
            )
            await expect(
                authController.login(mockHeaderRequest, mockLoginData),
            ).rejects.toThrow(
                'An unexpected error occurred. Please try again later.',
            )
        })
    })

    describe('verifyEmail', () => {
        it('should call userService.selectByEmail with correct email and allUsers false', async () => {
            const sut =
                mockUserService.selectByEmail.mockResolvedValue('any_user_id')

            await authController.verifyEmail({
                email: 'any_valid@mail.com',
                allUsers: false,
            })

            expect(sut).toHaveBeenCalledWith('any_valid@mail.com', false)
        })
        it('should call userService.selectByEmail with correct email and allUsers true', async () => {
            const sut =
                mockUserService.selectByEmail.mockResolvedValue('any_user_id')

            await authController.verifyEmail({
                email: 'any_valid@mail.com',
                allUsers: true,
            })

            expect(sut).toHaveBeenCalledWith('any_valid@mail.com', true)
        })

        it('should return data response and status 200 when email is valid', async () => {
            mockUserService.selectByEmail.mockResolvedValue('any_user_id')
            const response = await authController.verifyEmail({
                email: 'any_valid@mail.com',
                allUsers: false,
            })
            expect(response.statusCode).toBe(200)
            expect(response.data).toEqual({ user_id: 'any_user_id' })
        })

        it('should throw HttpException if verifyEmail return null', async () => {
            try {
                mockUserService.selectByEmail.mockResolvedValue(null)
                await authController.verifyEmail({
                    email: 'any_valid@mail.com',
                    allUsers: false,
                })
            } catch (error) {
                const { response } = error as any
                expect(error).toBeInstanceOf(HttpException)
                expect(response.statusCode).toBe(400)
                expect(response.message).toBe('Email not found !')
            }
        })
        it('should throw HttpException if verifyEmail throw', async () => {
            const errorException = new HttpException(
                'Any error message',
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
            mockUserService.selectByEmail.mockRejectedValue(errorException)
            const response = authController.verifyEmail({
                email: 'any_valid@mail.com',
                allUsers: false,
            })
            await expect(response).rejects.toThrow('Http Exception')
        })
    })

    describe('refresh-token', () => {
        const mockRefreshToeknResponse: RefreshTokenResponse = {
            accessToken: 'any_access_token',
            refreshToken: 'any_refresh_token',
        }
        it('should call authService.refreshToken with correct email', async () => {
            const sut = mockAuthService.refreshToken.mockResolvedValue(
                mockRefreshToeknResponse,
            )
            await authController.refresh({ refreshToken: 'any_refresh_token' })
            expect(sut).toHaveBeenCalledWith('any_refresh_token')
        })
        it('should return data response and status 200 when refreshToken is valid', async () => {
            mockAuthService.refreshToken.mockResolvedValue(
                mockRefreshToeknResponse,
            )
            const response = await authController.refresh({
                refreshToken: 'any_refresh_token',
            })
            expect(response.statusCode).toBe(200)
            expect(response.data).toEqual(mockRefreshToeknResponse)
        })
        it('should throw HttpException refreshToken throw', async () => {
            mockAuthService.refreshToken.mockRejectedValue(null)
            const response = authController.refresh({
                refreshToken: 'any_refresh_token',
            })
            await expect(response).rejects.toThrow(
                'An unexpected error occurred. Please try again later.',
            )
        })
    })

    describe('reset-password-by-email', () => {
        it('should call authService.resetPasswordForEmail with correct email', async () => {
            const sut =
                mockAuthService.resetPasswordForEmail.mockResolvedValue(true)
            await authController.resetPasswordByEmail({
                email: 'any_valid@mail.com',
            })
            expect(sut).toHaveBeenCalledWith('any_valid@mail.com')
        })
        it('should return data response and status 200 when send email success', async () => {
            mockAuthService.resetPasswordForEmail.mockResolvedValue(true)
            const response = await authController.resetPasswordByEmail({
                email: 'any_valid@mail.com',
            })
            expect(response.statusCode).toBe(200)
            expect(response.data).toEqual('Email send successfully')
        })
        it('should throw HttpException if refreshToken return false', async () => {
            mockAuthService.refreshToken.mockRejectedValue(false)
            const response = authController.resetPasswordByEmail({
                email: 'any_valid@mail.com',
            })
            await expect(response).rejects.toThrow(
                'An unexpected error occurred. Please try again later.',
            )
        })
        it('should throw HttpException if resetPasswordForEmail throw', async () => {
            mockAuthService.resetPasswordForEmail.mockRejectedValue(
                new HttpException(
                    'Any error message',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                ),
            )
            const response = authController.resetPasswordByEmail({
                email: 'any_valid@mail.com',
            })
            await expect(response).rejects.toThrow(
                'An unexpected error occurred. Please try again later.',
            )
        })
    })

    describe('reset-password', () => {
        const mockResetPasswordRequest: ResetPasswordRequest = {
            password: 'any_password',
            confirmPassword: 'any_password',
            accessToken: 'any_accessToken',
            refreshToken: 'any_refreshToken',
        }

        it('should call authService.resetPassword with correct values', async () => {
            const sut = mockAuthService.resetPassword.mockResolvedValue({
                passwordReset: true,
                emailSend: true,
            })

            await authController.resetPassword(mockResetPasswordRequest)

            expect(sut).toHaveBeenCalledWith(mockResetPasswordRequest)
        })

        it('should return data response and status 200 when password is updated', async () => {
            const mockResetPasswordResponse: ResetPasswordResponse = {
                passwordReset: true,
                emailSend: true,
            }
            mockAuthService.resetPassword.mockResolvedValue(
                mockResetPasswordResponse,
            )
            const response = await authController.resetPassword(
                mockResetPasswordRequest,
            )
            expect(response.statusCode).toBe(200)
            expect(response.data).toEqual({
                emailSend: mockResetPasswordResponse.emailSend,
                passwordReset: mockResetPasswordResponse.passwordReset,
                message: 'Password updated successfully',
            })
        })

        it('should throw HttpException if resetPassword return false', async () => {
            mockAuthService.resetPassword.mockResolvedValue({
                passwordReset: false,
                emailSend: false,
            })
            const response = authController.resetPassword(
                mockResetPasswordRequest,
            )
            await expect(response).rejects.toThrow(
                'An unexpected error occurred. Please try again later.',
            )
        })
        it('should throw HttpException if resetPassword throw', async () => {
            mockAuthService.resetPassword.mockRejectedValue(
                new HttpException(
                    'Any error message',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                ),
            )
            const response = authController.resetPassword(
                mockResetPasswordRequest,
            )
            await expect(response).rejects.toThrow(
                'An unexpected error occurred. Please try again later.',
            )
        })
    })

    describe('subordinatePasswordReset', () => {
        it('should call authService.resetPasswordForSubordinate with correct values', async () => {
            const sut =
                mockAuthService.resetPasswordForSubordinate.mockResolvedValue(
                    true,
                )
            await authController.subordinatePasswordReset({
                userId: 'any_user_id',
                password: 'any_password',
            })
            expect(sut).toHaveBeenCalledWith({
                userId: 'any_user_id',
                password: 'any_password',
            })
        })
        it('should return data response and status 200 when subordinatePasswordReset return success', async () => {
            mockAuthService.resetPasswordForSubordinate.mockResolvedValue(true)
            const response = await authController.subordinatePasswordReset({
                userId: 'any_user_id',
                password: 'any_password',
            })
            expect(response.statusCode).toBe(200)
            expect(response.data).toEqual(true)
        })
        it('should throw HttpException subordinatePasswordReset throw', async () => {
            mockAuthService.resetPasswordForSubordinate.mockRejectedValue(
                new HttpException(
                    'Any error message',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                ),
            )
            const response = authController.subordinatePasswordReset({
                userId: 'any_user_id',
                password: 'any_password',
            })
            await expect(response).rejects.toThrow(
                'An unexpected error occurred. Please try again later.',
            )
        })
    })

    describe('getSSOUrl', () => {
        it('should call authService.getSSOUrl with correct values', async () => {
            const sut = mockAuthService.getSSOUrl.mockResolvedValue({
                url: 'any_url',
            })
            await authController.getSSOUrl('any_url')
            expect(sut).toHaveBeenCalledWith('any_url')
        })
        it('should return data response and status 200 getSSOUrl return success', async () => {
            mockAuthService.getSSOUrl.mockResolvedValue({ url: 'any_url' })
            const response = await authController.getSSOUrl('any_url')
            expect(response.statusCode).toBe(200)
            expect(response.data).toEqual({ url: 'any_url' })
        })
        it('should throw HttpException getSSOUrl throw', async () => {
            mockAuthService.getSSOUrl.mockRejectedValue(
                new HttpException('Invalid URL', HttpStatus.BAD_REQUEST),
            )
            const response = authController.getSSOUrl('invalid_url')
            await expect(response).rejects.toThrow(
                'An unexpected error occurred. Please try again later.',
            )
        })
    })
    describe('confirmationEmail', () => {
        it('should call authService.confirmationEmail with correct values', async () => {
            const sut =
                mockAuthService.confirmationEmail.mockResolvedValue(true)
            await authController.confirmationEmail({ code: 'any_code' })
            expect(sut).toHaveBeenCalledWith({ code: 'any_code' })
        })
        it('should return data response and status 200 when confirmationEmail return success', async () => {
            mockAuthService.confirmationEmail.mockResolvedValue(true)
            const response = await authController.confirmationEmail({
                code: 'any_code',
            })
            expect(response.statusCode).toBe(200)
            expect(response.data).toEqual(
                "Your account has been successfully activated! You can now log in using your organization's Single Sign - On(SSO).",
            )
        })
        it('should throw HttpException if confirmationEmail return false', async () => {
            mockAuthService.confirmationEmail.mockResolvedValue(false)
            const promise = authController.confirmationEmail({
                code: 'any_code',
            })
            await expect(promise).rejects.toThrow(
                'Your activation link has expired. Please request a new activation link to proceed.',
            )
        })
        it('should throw HttpException if confirmationEmail throw', async () => {
            mockAuthService.confirmationEmail.mockRejectedValue(
                new HttpException(
                    'Any error message',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                ),
            )
            const response = authController.confirmationEmail({
                code: 'any_code',
            })
            await expect(response).rejects.toThrow('Any error message')
        })
    })
    describe('sendNewActivateLink', () => {
        const mockRequest = (): IAuthCustomRequest =>
            ({
                user: {
                    email: 'test@example.com',
                    profile: {
                        first_name: 'John',
                        last_name: 'Doe',
                        access_id: '1234',
                        access_name: 'Admin',
                    },
                    session_id: 'session-123',
                    user_id: 'user-456',
                    user_permissions: [],
                    access_id: 'access-789',
                },
                authToken: 'mock-token',
                headers: {},
                body: {},
                params: {},
                query: {},
                method: 'GET',
                url: '/test-route',
                path: '/test-route',
                protocol: 'http',
                get: jest.fn(),
            }) as unknown as IAuthCustomRequest
        it('should call authService.generateActivateLink with correct values', async () => {
            const sut =
                mockAuthService.generateActivateLink.mockResolvedValue(true)
            await authController.sendNewActivateLink(
                { userId: 'any_user_id' },
                mockRequest(),
            )
            expect(sut).toHaveBeenCalledWith({
                userId: 'any_user_id',
                token: mockRequest().authToken,
            })
        })
        it('should return data response and status 200 when sendNewActivateLink return success', async () => {
            mockAuthService.generateActivateLink.mockResolvedValue(true)
            const response = await authController.sendNewActivateLink(
                { userId: 'any_user_id' },
                mockRequest(),
            )
            expect(response.statusCode).toBe(200)
            expect(response.data).toEqual(
                'New activation link sent successfully',
            )
        })
        it('should throw HttpException if sendNewActivateLink return false', async () => {
            mockAuthService.generateActivateLink.mockResolvedValue(false)
            const response = authController.sendNewActivateLink(
                { userId: 'any_user_id' },
                mockRequest(),
            )
            await expect(response).rejects.toThrow(
                'An unexpected error occurred. Please try again later.',
            )
        })
        it('should throw HttpException if sendNewActivateLink throw', async () => {
            mockAuthService.generateActivateLink.mockRejectedValue(
                new HttpException('Error', HttpStatus.INTERNAL_SERVER_ERROR),
            )
            const response = authController.sendNewActivateLink(
                { userId: 'any_user_id' },
                mockRequest(),
            )
            await expect(response).rejects.toThrow(
                'An unexpected error occurred. Please try again later.',
            )
        })
    })
    describe('enrollMFA', () => {
        const mockMFAEnrollRequest = (): MFAEnrollRequest => ({
            factorType: FactorType.TOTP,
            friendlyName: 'Test MFA Device',
        })

        const mockMFAEnrollResponse = (): MFAEnrollResponse => ({
            id: 'mfa-123',
            type: 'totp',
            totp: {
                qr_code: 'mock-qrcode-string',
                secret: 'mock-secret-key',
                uri: 'otpauth://totp/Example?secret=mock-secret-key&issuer=TestIssuer',
            },
            friendly_name: 'Test MFA Device',
        })

        it('should call authService.enrollMFA with correct values', async () => {
            const sut = mockAuthService.enrollMFA.mockResolvedValue(
                mockMFAEnrollResponse(),
            )

            await authController.enrollMFA(mockMFAEnrollRequest())
            expect(sut).toHaveBeenCalledWith(mockMFAEnrollRequest())
        })
        it('should return data response and status 200 when enrollMFA return success', async () => {
            mockAuthService.enrollMFA.mockResolvedValue(mockMFAEnrollResponse())
            const response = await authController.enrollMFA(
                mockMFAEnrollRequest(),
            )
            expect(response.statusCode).toBe(200)
            expect(response.data).toEqual(mockMFAEnrollResponse())
        })
        it('should throw HttpException if enrollMFA return null', async () => {
            mockAuthService.enrollMFA.mockResolvedValue(null)
            const response = authController.enrollMFA(mockMFAEnrollRequest())
            await expect(response).rejects.toThrow(
                'An unexpected error occurred. Please try again later.',
            )
        })
        it('should throw HttpException if enrollMFA throw', async () => {
            mockAuthService.enrollMFA.mockRejectedValue(
                new HttpException('Error', HttpStatus.INTERNAL_SERVER_ERROR),
            )
            const response = authController.enrollMFA(mockMFAEnrollRequest())
            await expect(response).rejects.toThrow(
                'An unexpected error occurred. Please try again later.',
            )
        })
    })
    describe('unenrollMFA', () => {
        const mockMFAUnenrollRequest = (): MFAUnenrollRequest => ({
            factorId: 'any_factor_id',
        })
        const mockMFAUnenrollResponse = (): MFAUnenrollResponse => ({
            id: 'any_factor_id',
        })
        it('should call authService.unenrollMFA with correct values', async () => {
            const sut = mockAuthService.unenrollMFA.mockResolvedValue(
                mockMFAUnenrollResponse(),
            )
            await authController.unenrollMFA(mockMFAUnenrollRequest())
            expect(sut).toHaveBeenCalledWith(mockMFAUnenrollRequest())
        })
        it('should return data response and status 200 when unenrollMFA return success', async () => {
            mockAuthService.unenrollMFA.mockResolvedValue(
                mockMFAUnenrollResponse(),
            )
            const response = await authController.unenrollMFA(
                mockMFAUnenrollRequest(),
            )
            expect(response.statusCode).toBe(200)
            expect(response.data).toEqual(mockMFAUnenrollResponse())
        })
        it('should throw HttpException if unenrollMFA return null', async () => {
            mockAuthService.unenrollMFA.mockResolvedValue(null)
            const response = authController.unenrollMFA(
                mockMFAUnenrollRequest(),
            )
            await expect(response).rejects.toThrow(
                'An unexpected error occurred. Please try again later.',
            )
        })
        it('should throw HttpException if unenrollMFA throw', async () => {
            mockAuthService.unenrollMFA.mockRejectedValue(
                new HttpException('Error', HttpStatus.INTERNAL_SERVER_ERROR),
            )
            const response = authController.unenrollMFA(
                mockMFAUnenrollRequest(),
            )
            await expect(response).rejects.toThrow(
                'An unexpected error occurred. Please try again later.',
            )
        })
    })
    describe('createMFAChallenge', () => {
        const mockMFAChallengeRequest = (): MFAChallengeRequest => ({
            factorId: 'mfa-123',
        })

        const mockMFAChallengeResponse = (): MFAChallengeResponse => ({
            id: 'mfa-123',
            type: 'totp',
            expires_at: 1712985600,
        })

        it('should call authService.createMFAChallenge with correct values', async () => {
            const sut = mockAuthService.createMFAChallenge.mockResolvedValue(
                mockMFAChallengeResponse(),
            )
            await authController.createMFAChallenge(mockMFAChallengeRequest())
            expect(sut).toHaveBeenCalledWith(mockMFAChallengeRequest())
        })
        it('should return data response and status 200 when createMFAChallenge return success', async () => {
            mockAuthService.createMFAChallenge.mockResolvedValue(
                mockMFAChallengeResponse(),
            )
            const response = await authController.createMFAChallenge(
                mockMFAChallengeRequest(),
            )
            expect(response.statusCode).toBe(200)
            expect(response.data).toEqual(mockMFAChallengeResponse())
        })
        it('should throw HttpException if createMFAChallenge return null', async () => {
            mockAuthService.createMFAChallenge.mockResolvedValue(null)
            const response = authController.createMFAChallenge(
                mockMFAChallengeRequest(),
            )
            await expect(response).rejects.toThrow(
                'An unexpected error occurred. Please try again later.',
            )
        })
        it('should throw HttpException if createMFAChallenge throw', async () => {
            mockAuthService.createMFAChallenge.mockRejectedValue(
                new HttpException('Error', HttpStatus.INTERNAL_SERVER_ERROR),
            )
            const response = authController.createMFAChallenge(
                mockMFAChallengeRequest(),
            )
            await expect(response).rejects.toThrow(
                'An unexpected error occurred. Please try again later.',
            )
        })
    })
    describe('challengeVerifyMFA', () => {
        const mockMFAChallengeVerifyRequest =
            (): MFAChallengeVerifyRequest => ({
                factorId: 'mfa-123',
                code: '123456',
            })

        const mockMFAChallengeVerifyResponse =
            (): MFAChallengeVerifyResponse => ({
                access_token: 'mock-access-token',
                token_type: 'Bearer',
                expires_in: 3600,
                refresh_token: 'mock-refresh-token',
                user: {
                    id: 'user-123',
                    app_metadata: {
                        provider: 'email',
                        providers: ['email'],
                    },
                    user_metadata: {},
                    aud: 'authenticated',
                    created_at: '2024-11-28T20:36:35.470113Z',
                },
            })

        const mockAuthRequest = (): IAuthCustomRequest =>
            ({
                user: {
                    email: 'test@example.com',
                    profile: {
                        first_name: 'John',
                        last_name: 'Doe',
                        access_id: '1234',
                        access_name: 'Admin',
                    },
                    session_id: 'session-123',
                    user_id: 'user-456',
                    user_permissions: [],
                    access_id: 'access-789',
                },
                authToken: 'mock-token',
                headers: {},
                body: {},
                params: {},
                query: {},
                method: 'GET',
                url: '/test-route',
                path: '/test-route',
                protocol: 'http',
                get: jest.fn(),
            }) as unknown as IAuthCustomRequest

        const mockHeaderRequest = (): any => ({
            headers: {
                'x-forwarded-for': '127.0.0.1',
            },
        })
        const mockSupabaseHeaders = (): ISupabaseHeadersRequest => ({
            ipAddress: '127.0.0.1',
            token: 'mock-token',
        })
        it('should call authService.challengeVerifyMFA with correct values', async () => {
            const sut = mockAuthService.challengeVerifyMFA.mockResolvedValue(
                mockMFAChallengeVerifyResponse(),
            )
            await authController.challengeVerifyMFA(
                mockHeaderRequest(),
                mockMFAChallengeVerifyRequest(),
                mockAuthRequest(),
            )
            expect(sut).toHaveBeenCalledWith(
                mockMFAChallengeVerifyRequest(),
                mockSupabaseHeaders(),
            )
        })
        it('should return data response and status 200 when challengeVerifyMFA return success', async () => {
            mockAuthService.challengeVerifyMFA.mockResolvedValue(
                mockMFAChallengeVerifyResponse(),
            )
            const response = await authController.challengeVerifyMFA(
                mockHeaderRequest(),
                mockMFAChallengeVerifyRequest(),
                mockAuthRequest(),
            )
            expect(response.statusCode).toBe(200)
            expect(response.data).toEqual(mockMFAChallengeVerifyResponse())
        })
        it('should throw HttpException if challengeVerifyMFA return null', async () => {
            mockAuthService.challengeVerifyMFA.mockResolvedValue(null)
            const response = authController.challengeVerifyMFA(
                mockHeaderRequest(),
                mockMFAChallengeVerifyRequest(),
                mockAuthRequest(),
            )
            await expect(response).rejects.toThrow(
                'An unexpected error occurred. Please try again later.',
            )
        })
        it('should throw HttpException if challengeVerifyMFA throw', async () => {
            mockAuthService.challengeVerifyMFA.mockRejectedValue(
                new HttpException('Error', HttpStatus.INTERNAL_SERVER_ERROR),
            )
            const response = authController.challengeVerifyMFA(
                mockHeaderRequest(),
                mockMFAChallengeVerifyRequest(),
                mockAuthRequest(),
            )
            await expect(response).rejects.toThrow(
                'An unexpected error occurred. Please try again later.',
            )
        })
    })
    describe('verifyMFA', () => {
        const mockMFAVerifyRequest = (): MFAVerifyRequest => ({
            factorId: 'mfa-123',
            code: '123456',
            challengeId: 'challenge-123',
        })
        const mockMFAVerifyResponse = (): MFAVerifyResponse => ({
            access_token: 'mock-access-token',
            token_type: 'Bearer',
            expires_in: 3600,
            refresh_token: 'mock-refresh-token',
            user: {
                id: 'user-123',
                app_metadata: {
                    provider: 'email',
                    providers: ['email'],
                },
                user_metadata: {},
                aud: 'authenticated',
                created_at: '2024-11-28T20:36:35.470113Z',
            },
        })
        it('should call authService.verifyMFA with correct values', async () => {
            const sut = mockAuthService.verifyMFA.mockResolvedValue(
                mockMFAVerifyResponse(),
            )
            await authController.verifyMFA(mockMFAVerifyRequest())
            expect(sut).toHaveBeenCalledWith(mockMFAVerifyRequest())
        })
        it('should return data response and status 200 when verifyMFA return success', async () => {
            mockAuthService.verifyMFA.mockResolvedValue(mockMFAVerifyResponse())
            const response = await authController.verifyMFA(
                mockMFAVerifyRequest(),
            )
            expect(response.statusCode).toBe(200)
            expect(response.data).toEqual(mockMFAVerifyResponse())
        })
        it('should throw HttpException if verifyMFA return null', async () => {
            mockAuthService.verifyMFA.mockResolvedValue(null)
            const response = authController.verifyMFA(mockMFAVerifyRequest())
            await expect(response).rejects.toThrow(
                'An unexpected error occurred. Please try again later.',
            )
        })
        it('should throw HttpException if verifyMFA throw', async () => {
            mockAuthService.verifyMFA.mockRejectedValue(
                new HttpException('Error', HttpStatus.INTERNAL_SERVER_ERROR),
            )
            const response = authController.verifyMFA(mockMFAVerifyRequest())
            await expect(response).rejects.toThrow(
                'An unexpected error occurred. Please try again later.',
            )
        })
    })
    describe('checkAuthenticatorAssuranceLevel', () => {
        const mockAuthenticatorAssuranceLevelResponse =
            (): AuthenticatorAssuranceLevelResponse => ({
                currentLevel: 'passkey',
                nextLevel: 'passkey',
                currentAuthenticationMethods: [],
            })
        it('should call authService.checkAuthenticatorAssuranceLevel with correct values', async () => {
            const sut =
                mockAuthService.checkAuthenticatorAssuranceLevel.mockResolvedValue(
                    mockAuthenticatorAssuranceLevelResponse(),
                )
            await authController.checkAuthenticatorAssuranceLevel()
            expect(sut).toHaveBeenCalled()
        })
        it('should return data response and status 200 when checkAuthenticatorAssuranceLevel return success', async () => {
            mockAuthService.checkAuthenticatorAssuranceLevel.mockResolvedValue(
                mockAuthenticatorAssuranceLevelResponse(),
            )
            const response =
                await authController.checkAuthenticatorAssuranceLevel()
            expect(response.statusCode).toBe(200)
            expect(response.data).toEqual(
                mockAuthenticatorAssuranceLevelResponse(),
            )
        })
        it('should throw HttpException if checkAuthenticatorAssuranceLevel return null', async () => {
            mockAuthService.checkAuthenticatorAssuranceLevel.mockResolvedValue(
                null,
            )
            const response = authController.checkAuthenticatorAssuranceLevel()
            await expect(response).rejects.toThrow(
                'An unexpected error occurred. Please try again later.',
            )
        })
        it('should throw HttpException if checkAuthenticatorAssuranceLevel throw', async () => {
            mockAuthService.checkAuthenticatorAssuranceLevel.mockRejectedValue(
                new HttpException('Error', HttpStatus.INTERNAL_SERVER_ERROR),
            )
            const response = authController.checkAuthenticatorAssuranceLevel()
            await expect(response).rejects.toThrow(
                'An unexpected error occurred. Please try again later.',
            )
        })
    })
    describe('listMFAFactors', () => {
        const mockMFAListResponse = (): MFAListResponse => ({
            all: [],
            totp: [],
            phone: [],
        })
        it('should call authService.listMFAFactors with correct values', async () => {
            const sut = mockAuthService.listMFAFactors.mockResolvedValue(
                mockMFAListResponse(),
            )
            await authController.listMFAFactors()
            expect(sut).toHaveBeenCalled()
        })
        it('should return data response and status 200 when listMFAFactors return success', async () => {
            mockAuthService.listMFAFactors.mockResolvedValue(
                mockMFAListResponse(),
            )
            const response = await authController.listMFAFactors()
            expect(response.statusCode).toBe(200)
            expect(response.data).toEqual(mockMFAListResponse())
        })
        it('should throw HttpException if listMFAFactors return null', async () => {
            mockAuthService.listMFAFactors.mockResolvedValue(null)
            const response = authController.listMFAFactors()
            await expect(response).rejects.toThrow(
                'An unexpected error occurred. Please try again later.',
            )
        })
        it('should throw HttpException if listMFAFactors throw', async () => {
            mockAuthService.listMFAFactors.mockRejectedValue(
                new HttpException('Error', HttpStatus.INTERNAL_SERVER_ERROR),
            )
            const response = authController.listMFAFactors()
            await expect(response).rejects.toThrow(
                'An unexpected error occurred. Please try again later.',
            )
        })
    })
    describe('removeUnverifiedFactors', () => {
        const mockMFARemoveUnverifiedFactorsResponse =
            (): MFARemoveUnverifiedFactorsResponse => ({
                success: true,
                message: 'Unverified factors removed successfully',
            })
        it('should call authService.removeUnverifiedFactors with correct values', async () => {
            const sut =
                mockAuthService.removeUnverifiedFactors.mockResolvedValue(
                    mockMFARemoveUnverifiedFactorsResponse(),
                )
            await authController.removeUnverifiedFactors()
            expect(sut).toHaveBeenCalled()
        })
        it('should return data response and status 200 when removeUnverifiedFactors return success', async () => {
            mockAuthService.removeUnverifiedFactors.mockResolvedValue(
                mockMFARemoveUnverifiedFactorsResponse(),
            )
            const response = await authController.removeUnverifiedFactors()
            expect(response.statusCode).toBe(200)
            expect(response.data).toEqual(
                mockMFARemoveUnverifiedFactorsResponse(),
            )
        })
        it('should throw HttpException if removeUnverifiedFactors return null', async () => {
            mockAuthService.removeUnverifiedFactors.mockResolvedValue(null)
            const response = authController.removeUnverifiedFactors()
            await expect(response).rejects.toThrow(
                'An unexpected error occurred. Please try again later.',
            )
        })
        it('should throw HttpException if removeUnverifiedFactors throw', async () => {
            mockAuthService.removeUnverifiedFactors.mockRejectedValue(
                new HttpException('Error', HttpStatus.INTERNAL_SERVER_ERROR),
            )
            const response = authController.removeUnverifiedFactors()
            await expect(response).rejects.toThrow(
                'An unexpected error occurred. Please try again later.',
            )
        })
    })
    describe('sign-out', () => {
        const mockAuthRequest = (): IAuthCustomRequest =>
            ({
                user: {
                    email: 'test@example.com',
                },
            }) as unknown as IAuthCustomRequest
        it('should call authService.signOut with correct values', async () => {
            const sut = mockAuthService.signOut.mockResolvedValue()
            await authController.logout(mockAuthRequest())
            expect(sut).toHaveBeenCalled()
        })
        it('should return data response and status 200 when logout return success', async () => {
            mockAuthService.signOut.mockResolvedValue()
            const response = await authController.logout(mockAuthRequest())
            expect(response.statusCode).toBe(200)
            expect(response.data).toEqual('Successfully logged out.')
        })
    })
})
