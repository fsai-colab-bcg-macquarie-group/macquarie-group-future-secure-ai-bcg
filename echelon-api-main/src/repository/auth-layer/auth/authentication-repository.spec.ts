import { AuthSessionResponse } from 'src/domain/auth-layer/auth/response/auth-session-response'
import { AuthenticationRepository } from './authentication-repository'
import {
    AuthMFAEnrollTOTPResponse,
    AuthMFAUnenrollResponse,
    AuthMFAVerifyResponse,
    MFAChallengeAndVerifyParams,
    User,
} from '@supabase/supabase-js'
import { FactorType } from 'src/domain/auth-layer/auth/request/mfa-request'
import {
    AuthenticatorAssuranceLevelResponse,
    MFAChallengeResponse,
    MFAChallengeVerifyResponse,
    MFAListResponse,
    MFARemoveUnverifiedFactorsResponse,
} from 'src/domain/auth-layer/auth/response/mfa-response'
import { ISupabaseHeadersRequest } from 'src/domain/auth-layer/auth/request'

const mockChain = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    single: jest.fn(),
    eq: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    rpc: jest.fn(),
    delete: jest.fn().mockReturnThis(),
    match: jest.fn().mockReturnThis(),
    is: jest.fn().mockReturnThis(),
    auth: {
        signInWithPassword: jest.fn(),
        refreshSession: jest.fn(),
        signOut: jest.fn(),
        signInWithSSO: jest.fn(),
        resetPasswordForEmail: jest.fn(),
        mfa: {
            enroll: jest.fn(),
            verify: jest.fn(),
            unenroll: jest.fn(),
            getAuthenticatorAssuranceLevel: jest.fn(),
            challenge: jest.fn(),
            challengeAndVerify: jest.fn(),
            listFactors: jest.fn(),
        },
    },
}

jest.mock('@supabase/supabase-js', () => ({
    createClient: jest.fn(() => ({
        schema: jest.fn(() => mockChain),
        auth: mockChain.auth,
    })),
}))

describe('AuthenticationRepository', () => {
    const mockUser: User = {
        id: 'test-user-id',
        email: 'test-email',
        app_metadata: {},
        user_metadata: {},
        aud: 'test-aud',
        created_at: new Date().toISOString(),
        confirmed_at: new Date().toISOString(),
        email_confirmed_at: new Date().toISOString(),
        phone_confirmed_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString(),
        role: 'test-role',
    }
    const mockUserSession: AuthSessionResponse = {
        session: {
            access_token: 'test-access-token',
            refresh_token: 'test-refresh-token',
            expires_in: 3600,
            expires_at: Date.now() + 3600 * 1000,
            token_type: 'Bearer',
            user: mockUser,
        },
        user: mockUser,
    }
    let authenticationRepository: AuthenticationRepository

    beforeEach(() => {
        jest.clearAllMocks()

        authenticationRepository = new AuthenticationRepository()
    })

    it('should be defined', () => {
        expect(authenticationRepository).toBeDefined()
    })

    describe('confirmationEmailSSO', () => {
        it('should return false when code is not found', async () => {
            mockChain.single.mockResolvedValueOnce({
                data: null,
                error: null,
            })
            mockChain.eq.mockReturnThis()

            const result = await authenticationRepository.confirmationEmailSSO({
                code: 'test-code',
            })

            expect(result).toBeFalsy()
        })

        it('should return false when code has expired', async () => {
            const expiredDate = new Date(
                Date.now() - 60 * 60 * 1000,
            ).toISOString()
            mockChain.single.mockResolvedValueOnce({
                data: {
                    email_is_active: false,
                    email_expiraded_at: expiredDate,
                    user_id: 'test-user-id',
                },
                error: null,
            })

            const result = await authenticationRepository.confirmationEmailSSO({
                code: 'test-code',
            })

            expect(result).toBeFalsy()
        })
        it('should return false when code is found and email is already active', async () => {
            const futureDate = new Date(
                Date.now() + 60 * 60 * 1000,
            ).toISOString()
            mockChain.single.mockResolvedValueOnce({
                data: {
                    email_is_active: true,
                    email_expiraded_at: futureDate,
                    user_id: 'test-user-id',
                },
                error: null,
            })

            mockChain.eq.mockReturnThis()
            mockChain.rpc.mockResolvedValueOnce({
                error: null,
            })

            mockChain.eq.mockReturnThis()

            const result = await authenticationRepository.confirmationEmailSSO({
                code: 'test-code',
            })

            expect(result).toBeFalsy()
        })
        it('should return true when code is found and email is not active', async () => {
            const futureDate = new Date(
                Date.now() + 60 * 60 * 1000,
            ).toISOString()
            mockChain.single.mockResolvedValueOnce({
                data: {
                    email_is_active: false,
                    email_expiraded_at: futureDate,
                    user_id: 'test-user-id',
                },
                error: null,
            })

            mockChain.eq.mockReturnThis()
            mockChain.rpc.mockResolvedValueOnce({
                error: null,
            })

            mockChain.eq.mockReturnThis()

            const result = await authenticationRepository.confirmationEmailSSO({
                code: 'test-code',
            })

            expect(result).toBeTruthy()
        })
        it('should throw an error when supabase confirmationEmailSSO returns an error', async () => {
            const error = new Error('any-error')
            mockChain.single.mockResolvedValueOnce({
                data: null,
                error: error,
            })
            const promise = authenticationRepository.confirmationEmailSSO({
                code: 'test-code',
            })
            await expect(promise).rejects.toThrow(error)
        })
    })
    describe('signInWithEmail', () => {
        it('should return a user and a session when the email and password are correct', async () => {
            mockChain.auth.signInWithPassword.mockResolvedValueOnce({
                data: mockUserSession,
                error: null,
            })
            const result = await authenticationRepository.signInWithEmail(
                'test-email',
                'test-password',
            )
            expect(result).toEqual({
                user: mockUser,
                session: mockUserSession.session,
            })
        })
        it('should return null when supabase signInWithEmail returns null', async () => {
            mockChain.auth.signInWithPassword.mockResolvedValueOnce({
                data: { user: null, session: null },
                error: null,
            })
            const result = await authenticationRepository.signInWithEmail(
                'test-email',
                'test-password',
            )
            expect(result).toBeNull()
        })

        it('should throw an error when supabase signInWithEmail returns an error', async () => {
            const error = new Error('any-error')
            mockChain.auth.signInWithPassword.mockResolvedValueOnce({
                data: null,
                error: error,
            })
            const promise = authenticationRepository.signInWithEmail(
                'test-email',
                'test-password',
            )
            await expect(promise).rejects.toThrow(error)
        })
    })
    describe('signInWithSSO', () => {
        it('should return a url when the domain is correct', async () => {
            mockChain.auth.signInWithSSO.mockResolvedValueOnce({
                data: { url: 'test-url' },
                error: null,
            })
            const result =
                await authenticationRepository.signInWithSSO('test-domain')
            expect(result).toEqual({ url: 'test-url' })
        })
        it('should throw an error when supabase signInWithSSO returns an error', async () => {
            const error = new Error('any-error')
            mockChain.auth.signInWithSSO.mockResolvedValueOnce({
                data: null,
                error: error,
            })
            const promise =
                authenticationRepository.signInWithSSO('test-domain')
            await expect(promise).rejects.toThrow(error)
        })
    })
    describe('refreshToken', () => {
        it('should return a user and a session when the refresh token is correct', async () => {
            mockChain.auth.refreshSession.mockResolvedValueOnce({
                data: mockUserSession,
                error: null,
            })
            const result =
                await authenticationRepository.refreshToken(
                    'test-refresh-token',
                )
            expect(result).toEqual({
                user: mockUser,
                session: mockUserSession.session,
            })
        })
        it('should return null when supabase refreshToken returns null', async () => {
            mockChain.auth.refreshSession.mockResolvedValueOnce({
                data: null,
                error: null,
            })
            const result =
                await authenticationRepository.refreshToken(
                    'test-refresh-token',
                )
            expect(result).toBeNull()
        })
        it('should throw an error when supabase refreshToken returns an error', async () => {
            const error = new Error('any-error')
            mockChain.auth.refreshSession.mockResolvedValueOnce({
                data: null,
                error: error,
            })
            const promise =
                authenticationRepository.refreshToken('test-refresh-token')
            await expect(promise).rejects.toThrow(error)
        })
    })
    describe('resetPasswordForEmail', () => {
        it('should return true when the email is found', async () => {
            mockChain.auth.resetPasswordForEmail.mockResolvedValueOnce({
                data: true,
                error: null,
            })
            const result =
                await authenticationRepository.resetPasswordForEmail(
                    'test-email',
                )
            expect(result).toBeTruthy()
        })
        it('should return false when the email is not found', async () => {
            mockChain.auth.resetPasswordForEmail.mockResolvedValueOnce({
                data: false,
                error: null,
            })
            const result =
                await authenticationRepository.resetPasswordForEmail(
                    'test-email',
                )
            expect(result).toBeFalsy()
        })
        it('should throw an error when supabase resetPasswordForEmail returns an error', async () => {
            const error = new Error('any-error')
            mockChain.auth.resetPasswordForEmail.mockResolvedValueOnce({
                data: null,
                error: error,
            })
            const promise =
                authenticationRepository.resetPasswordForEmail('test-email')
            await expect(promise).rejects.toThrow(error)
        })
    })
    describe('resetPasswordForSubordinate', () => {
        it('should return true when the email and password are correct', async () => {
            mockChain.rpc.mockResolvedValueOnce({
                data: true,
                error: null,
            })
            const result =
                await authenticationRepository.resetPasswordForSubordinate({
                    userId: 'test-user-id',
                    password: 'test-password',
                })
            expect(result).toBeTruthy()
        })
        // it('should throw an error when supabase resetPasswordForSubordinate returns an error', async () => {
        //     const error = new Error('any-error')
        //     mockChain.rpc.mockRejectedValueOnce(() => {
        //         throw error
        //     })
        //     const promise =
        //         authenticationRepository.resetPasswordForSubordinate({
        //             userId: 'test-user-id',
        //             password: 'test-password',
        //         })
        //     await expect(promise).rejects.toThrow(error)
        // })
    })
    describe('signOut', () => {
        it('should call supabase signOut', async () => {
            mockChain.auth.signOut.mockResolvedValueOnce({
                data: true,
                error: null,
            })
            mockChain.is.mockReturnThis()
            await authenticationRepository.signOut({
                sessionId: 'test-session-id',
                userId: 'test-user-id',
            })
            expect(mockChain.auth.signOut).toHaveBeenCalled()
        })
        it('should call supabase delete refresh token', async () => {
            mockChain.auth.signOut.mockResolvedValueOnce({
                data: true,
                error: null,
            })
            await authenticationRepository.signOut({
                sessionId: 'test-session-id',
                userId: 'test-user-id',
            })
            expect(mockChain.delete).toHaveBeenCalled()
        })
        it('should throw an error when supabase signOut returns an error', async () => {
            const error = new Error('any-error')
            mockChain.auth.signOut.mockResolvedValueOnce({
                data: null,
                error: error,
            })
            const promise = authenticationRepository.signOut({
                sessionId: 'test-session-id',
                userId: 'test-user-id',
            })
            await expect(promise).rejects.toThrow(error)
        })
        it('should throw an error when supabase delete refresh token returns an error', async () => {
            const error = new Error('any-error')
            mockChain.is.mockRejectedValueOnce(error)
            const promise = authenticationRepository.signOut({
                sessionId: 'test-session-id',
                userId: 'test-user-id',
            })
            await expect(promise).rejects.toThrow(new Error('any-error'))
        })
    })
    describe('handleFailedLogin', () => {
        // it('should return the remaining time when the user has not been locked', async () => {
        //     mockChain.rpc.mockResolvedValueOnce({
        //         data: { remaining_time: 1 },
        //         error: null,
        //     })
        //     const result =
        //         await authenticationRepository.handleFailedLogin('test-user-id')
        //     expect(result).toEqual(1)
        // })
        // it('should return the remaining time when the user has been locked', async () => {
        //     mockChain.rpc.mockResolvedValueOnce({
        //         data: { remaining_time: 1 },
        //         error: null,
        //     })
        //     const result =
        //         await authenticationRepository.handleFailedLogin('test-user-id')
        //     expect(result).toEqual(1)
        // })
    })
    describe('handleFailedLogin', () => {
        // it('should return the remaining time when the user has not been locked', async () => {
        //     mockChain.rpc.mockResolvedValueOnce({
        //         data: { remaining_time: 1 },
        //         error: null,
        //     })
        // })
        // it('should return the remaining time when the user has been locked', async () => {
        //     mockChain.rpc.mockResolvedValueOnce({
        //         data: { remaining_time: 1 },
        //         error: null,
        //     })
        // })
    })
    describe('enrollMFA', () => {
        const mockMFAEnrollResponse: AuthMFAEnrollTOTPResponse = {
            data: {
                id: 'test-id',
                type: 'totp',
                totp: {
                    qr_code: 'test-qr-code',
                    secret: 'test-secret',
                    uri: 'test-uri',
                },
                friendly_name: 'test-friendly-name',
            },
            error: null,
        }

        it('should call supabase enrollMFA  ', async () => {
            mockChain.auth.mfa.enroll.mockResolvedValueOnce({
                data: mockMFAEnrollResponse.data,
                error: null,
            })
            await authenticationRepository.enrollMFA({
                factorType: FactorType.TOTP,
                friendlyName: 'test-friendly-name',
            })
            expect(mockChain.auth.mfa.enroll).toHaveBeenCalled()
        })
        it('should return null when supabase enrollMFA returns null', async () => {
            mockChain.auth.mfa.enroll.mockResolvedValueOnce({
                data: null,
                error: null,
            })
            const result = await authenticationRepository.enrollMFA({
                factorType: FactorType.TOTP,
                friendlyName: 'test-friendly-name',
            })
            expect(result).toBeNull()
        })
        it('should return the mfa enroll response when supabase enrollMFA returns a response', async () => {
            mockChain.auth.mfa.enroll.mockResolvedValueOnce(
                mockMFAEnrollResponse,
            )
            const result = await authenticationRepository.enrollMFA({
                factorType: FactorType.TOTP,
                friendlyName: 'test-friendly-name',
            })
            expect(result).toEqual(mockMFAEnrollResponse.data)
        })
        it('should throw an error when supabase enrollMFA returns an error', async () => {
            const error = new Error('any-error')

            mockChain.auth.mfa.enroll.mockResolvedValueOnce({
                data: null,
                error: error,
            })
            const promise = authenticationRepository.enrollMFA({
                factorType: FactorType.TOTP,
                friendlyName: 'test-friendly-name',
            })
            await expect(promise).rejects.toThrow(error)
        })
    })
    describe('verifyMFA', () => {
        const mockMFAVerifyResponse: AuthMFAVerifyResponse = {
            data: {
                access_token: 'test-access-token',
                token_type: 'Bearer',
                expires_in: 3600,
                refresh_token: 'test-refresh-token',
                user: mockUser,
            },
            error: null,
        }
        it('should call supabase verifyMFA', async () => {
            mockChain.auth.mfa.verify.mockResolvedValueOnce(
                mockMFAVerifyResponse,
            )
            await authenticationRepository.verifyMFA({
                factorId: 'test-factor-id',
                code: 'test-code',
                challengeId: 'test-challenge-id',
            })
            expect(mockChain.auth.mfa.verify).toHaveBeenCalled()
        })
        it('should return null when supabase verifyMFA returns null', async () => {
            mockChain.auth.mfa.verify.mockResolvedValueOnce({
                data: null,
                error: null,
            })
            const result = await authenticationRepository.verifyMFA({
                factorId: 'test-factor-id',
                code: 'test-code',
                challengeId: 'test-challenge-id',
            })
            expect(result).toBeNull()
        })
        it('should return the mfa verify response when supabase verifyMFA returns a response', async () => {
            mockChain.auth.mfa.verify.mockResolvedValueOnce(
                mockMFAVerifyResponse,
            )
            const result = await authenticationRepository.verifyMFA({
                factorId: 'test-factor-id',
                code: 'test-code',
                challengeId: 'test-challenge-id',
            })
            expect(result).toEqual(mockMFAVerifyResponse.data)
        })
        it('should throw an error when supabase verifyMFA returns an error', async () => {
            const error = new Error('any-error')
            mockChain.auth.mfa.verify.mockResolvedValueOnce({
                data: null,
                error: error,
            })
            const promise = authenticationRepository.verifyMFA({
                factorId: 'test-factor-id',
                code: 'test-code',
                challengeId: 'test-challenge-id',
            })
            await expect(promise).rejects.toThrow(error)
        })
    })
    describe('unenrollMFA', () => {
        const mockMFAUnenrollResponse: AuthMFAUnenrollResponse = {
            data: {
                id: 'test-id',
            },
            error: null,
        }
        it('should call supabase unenrollMFA', async () => {
            mockChain.auth.mfa.unenroll.mockResolvedValueOnce(
                mockMFAUnenrollResponse,
            )
            await authenticationRepository.unenrollMFA({
                factorId: 'test-factor-id',
            })
            expect(mockChain.auth.mfa.unenroll).toHaveBeenCalled()
        })
        it('should return null when supabase unenrollMFA returns null', async () => {
            mockChain.auth.mfa.unenroll.mockResolvedValueOnce({
                data: null,
                error: null,
            })
            const result = await authenticationRepository.unenrollMFA({
                factorId: 'test-factor-id',
            })
            expect(result).toBeNull()
        })
        it('should return the mfa unenroll response when supabase unenrollMFA returns a response', async () => {
            mockChain.auth.mfa.unenroll.mockResolvedValueOnce(
                mockMFAUnenrollResponse,
            )
            const result = await authenticationRepository.unenrollMFA({
                factorId: 'test-factor-id',
            })
            expect(result).toEqual(mockMFAUnenrollResponse.data)
        })
        it('should throw an error when supabase unenrollMFA returns an error', async () => {
            const error = new Error('any-error')
            mockChain.auth.mfa.unenroll.mockResolvedValueOnce({
                data: null,
                error: error,
            })
            const promise = authenticationRepository.unenrollMFA({
                factorId: 'test-factor-id',
            })
            await expect(promise).rejects.toThrow(error)
        })
    })
    describe('checkAuthenticatorAssuranceLevel', () => {
        const mockAuthenticatorAssuranceLevelResponse: AuthenticatorAssuranceLevelResponse =
            {
                currentLevel: 'test-current-level',
                nextLevel: 'test-next-level',
                currentAuthenticationMethods: [
                    {
                        method: 'mfa/totp',
                        timestamp: 1234567890,
                    },
                ],
            }

        it('should call supabase checkAuthenticatorAssuranceLevel', async () => {
            mockChain.auth.mfa.getAuthenticatorAssuranceLevel.mockResolvedValueOnce(
                {
                    data: mockAuthenticatorAssuranceLevelResponse,
                    error: null,
                },
            )
            await authenticationRepository.checkAuthenticatorAssuranceLevel()
            expect(
                mockChain.auth.mfa.getAuthenticatorAssuranceLevel,
            ).toHaveBeenCalled()
        })
        it('should return null when supabase checkAuthenticatorAssuranceLevel returns null', async () => {
            mockChain.auth.mfa.getAuthenticatorAssuranceLevel.mockResolvedValueOnce(
                {
                    data: null,
                    error: null,
                },
            )
            const result =
                await authenticationRepository.checkAuthenticatorAssuranceLevel()
            expect(result).toBeNull()
        })
        it('should return the authenticator assurance level response when supabase checkAuthenticatorAssuranceLevel returns a response', async () => {
            mockChain.auth.mfa.getAuthenticatorAssuranceLevel.mockResolvedValueOnce(
                {
                    data: mockAuthenticatorAssuranceLevelResponse,
                    error: null,
                },
            )
            const result =
                await authenticationRepository.checkAuthenticatorAssuranceLevel()
            expect(result).toEqual(mockAuthenticatorAssuranceLevelResponse)
        })
        it('should throw an error when supabase checkAuthenticatorAssuranceLevel returns an error', async () => {
            const error = new Error('any-error')
            mockChain.auth.mfa.getAuthenticatorAssuranceLevel.mockResolvedValueOnce(
                {
                    data: null,
                    error: error,
                },
            )
            const promise =
                authenticationRepository.checkAuthenticatorAssuranceLevel()
            await expect(promise).rejects.toThrow(error)
        })
    })
    describe('challengeVerifyMFA', () => {
        const mockSupabaseHeaders = (): ISupabaseHeadersRequest => ({
            ipAddress: '127.0.0.1',
            token: 'mock-token',
        })
        const mockMFAChallengeVerifyResponse: MFAChallengeVerifyResponse = {
            access_token: 'test-access-token',
            token_type: 'Bearer',
            expires_in: 3600,
            refresh_token: 'test-refresh-token',
            user: mockUser,
        }
        it('should call supabase challengeVerifyMFA', async () => {
            mockChain.auth.mfa.challengeAndVerify.mockResolvedValueOnce({
                data: mockMFAChallengeVerifyResponse,
                error: null,
            })
            await authenticationRepository.challengeVerifyMFA(
                {
                    factorId: 'test-factor-id',
                    code: 'test-code',
                },
                mockSupabaseHeaders(),
            )
            expect(mockChain.auth.mfa.challengeAndVerify).toHaveBeenCalled()
        })
        it('should return null when supabase challengeVerifyMFA returns null', async () => {
            mockChain.auth.mfa.challengeAndVerify.mockResolvedValueOnce({
                data: null,
                error: null,
            })
            const result = await authenticationRepository.challengeVerifyMFA(
                {
                    factorId: 'test-factor-id',
                    code: 'test-code',
                },
                mockSupabaseHeaders(),
            )
            expect(result).toBeNull()
        })
        it('should return the mfa challenge verify response when supabase challengeVerifyMFA returns a response', async () => {
            mockChain.auth.mfa.challengeAndVerify.mockResolvedValueOnce({
                data: mockMFAChallengeVerifyResponse,
                error: null,
            })
            const result = await authenticationRepository.challengeVerifyMFA(
                {
                    factorId: 'test-factor-id',
                    code: 'test-code',
                },
                mockSupabaseHeaders(),
            )
            expect(result).toEqual(mockMFAChallengeVerifyResponse)
        })
        it('should throw an error when supabase challengeVerifyMFA returns an error', async () => {
            const error = new Error('any-error')
            mockChain.auth.mfa.challengeAndVerify.mockResolvedValueOnce({
                data: null,
                error: error,
            })
            const promise = authenticationRepository.challengeVerifyMFA(
                {
                    factorId: 'test-factor-id',
                    code: 'test-code',
                },
                mockSupabaseHeaders(),
            )
            await expect(promise).rejects.toThrow(error)
        })
    })
    describe('createMFAChallenge', () => {
        const mockMFAChallengeResponse: MFAChallengeResponse = {
            id: 'test-id',
            type: 'totp',
            expires_at: 1234567890,
        }
        it('should call supabase createMFAChallenge', async () => {
            mockChain.auth.mfa.challenge.mockResolvedValueOnce({
                data: mockMFAChallengeResponse,
                error: null,
            })
            await authenticationRepository.createMFAChallenge({
                factorId: 'test-factor-id',
            })
            expect(mockChain.auth.mfa.challenge).toHaveBeenCalled()
        })
        it('should return null when supabase createMFAChallenge returns null', async () => {
            mockChain.auth.mfa.challenge.mockResolvedValueOnce({
                data: null,
                error: null,
            })
            const result = await authenticationRepository.createMFAChallenge({
                factorId: 'test-factor-id',
            })
            expect(result).toBeNull()
        })
        it('should return the mfa challenge response when supabase createMFAChallenge returns a response', async () => {
            mockChain.auth.mfa.challenge.mockResolvedValueOnce({
                data: mockMFAChallengeResponse,
                error: null,
            })
            const result = await authenticationRepository.createMFAChallenge({
                factorId: 'test-factor-id',
            })
            expect(result).toEqual(mockMFAChallengeResponse)
        })
        it('should throw an error when supabase createMFAChallenge returns an error', async () => {
            const error = new Error('any-error')
            mockChain.auth.mfa.challenge.mockResolvedValueOnce({
                data: null,
                error: error,
            })
            const promise = authenticationRepository.createMFAChallenge({
                factorId: 'test-factor-id',
            })
            await expect(promise).rejects.toThrow(error)
        })
    })
    describe('removeUnverifiedFactors', () => {
        const mockMFAListResponse: MFAListResponse = {
            all: [
                {
                    id: 'test-id',
                    factor_type: 'totp',
                    status: 'unverified',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
            ],
            totp: [
                {
                    id: 'test-id',
                    factor_type: 'totp',
                    status: 'unverified',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
            ],
            phone: [
                {
                    id: 'test-id',
                    factor_type: 'phone',
                    status: 'unverified',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
            ],
        }

        it('should return success false when supabase removeUnverifiedFactors returns null', async () => {
            mockChain.auth.mfa.listFactors.mockResolvedValueOnce({
                data: null,
                error: null,
            })
            const result =
                await authenticationRepository.removeUnverifiedFactors()
            expect(result).toEqual({
                success: false,
                message: 'No unverified factors found',
            })
        })
        it('should return success true when supabase removeUnverifiedFactors returns a response', async () => {
            mockChain.auth.mfa.listFactors.mockResolvedValueOnce({
                data: mockMFAListResponse,
                error: null,
            })
            mockChain.auth.mfa.unenroll.mockResolvedValueOnce({
                data: {
                    id: 'test-id',
                },
                error: null,
            })
            const result =
                await authenticationRepository.removeUnverifiedFactors()
            expect(result).toEqual({
                success: true,
                message: 'Unverified factors removed successfully',
            })
        })
    })
    describe('listMFAFactors', () => {
        const mockMFAListResponse: MFAListResponse = {
            all: [],
            totp: [],
            phone: [],
        }
        it('should call supabase listMFAFactors', async () => {
            mockChain.auth.mfa.listFactors.mockResolvedValueOnce({
                data: mockMFAListResponse,
                error: null,
            })
            await authenticationRepository.listMFAFactors()
            expect(mockChain.auth.mfa.listFactors).toHaveBeenCalled()
        })
        it('should return null when supabase listMFAFactors returns null', async () => {
            mockChain.auth.mfa.listFactors.mockResolvedValueOnce({
                data: null,
                error: null,
            })
            const result = await authenticationRepository.listMFAFactors()
            expect(result).toBeNull()
        })
        it('should return the mfa list factors response when supabase listMFAFactors returns a response', async () => {
            mockChain.auth.mfa.listFactors.mockResolvedValueOnce({
                data: mockMFAListResponse,
                error: null,
            })
            const result = await authenticationRepository.listMFAFactors()
            expect(result).toEqual(mockMFAListResponse)
        })
        it('should throw an error when supabase listMFAFactors returns an error', async () => {
            const error = new Error('any-error')
            mockChain.auth.mfa.listFactors.mockResolvedValueOnce({
                data: null,
                error: error,
            })
            const promise = authenticationRepository.listMFAFactors()
            await expect(promise).rejects.toThrow(error)
        })
    })
})
