import { IEMailNotificationService } from 'src/shared/services/interfaces/notification'
import { UserService } from './user-service'
import { IUsersRepository } from 'src/domain/interfaces/repository/auth-layer/users/i-users-repository'
import { UpsertUserFactory } from './factory-upsert-user'
import IDirectoryUserService from 'src/domain/interfaces/services/auth-layer/directory-user/i-directory-user-service'
import { UserModelDB } from 'src/domain/auth-layer/user/model'
import { PersistenceUpdateUserResponse } from 'src/domain/auth-layer/user/response/persistence-update-user-response'
import { IAccessHierarchyService } from 'src/domain/interfaces/services/auth-layer/access'
import { AddConfirmationEmailSSOResponse } from 'src/domain/auth-layer/user/response/add-confirmation-email-sso-response'
import { AddConfirmationEmailSSORequest } from 'src/domain/auth-layer/user/request/add-confirmation-email-sso-request'
import { User } from '@supabase/supabase-js'
import { FilterSelectUserResponse } from 'src/domain/auth-layer/user/response/filter-select-user-response'
import {
    AddUserRequest,
    UpdateUserRequest,
} from 'src/domain/auth-layer/user/request'
import { PersistenceAddUserResponse } from 'src/domain/auth-layer/user/response/persistence-add-user-response'
import { ResetPasswordRequest } from 'src/domain/auth-layer/auth/request/reset-password-request'
jest.mock('src/utils/jwt-utils', () => ({
    generateJWTToken: jest.fn(() => 'any-jwt-token'),
}))

describe('UserService', () => {
    let userService: UserService
    let mockUserRepository: jest.Mocked<IUsersRepository>
    let mockEmailService: jest.Mocked<IEMailNotificationService>
    let mockDirectoryUserService: jest.Mocked<IDirectoryUserService>
    let mockAccessHierarchyService: jest.Mocked<IAccessHierarchyService>
    let mockUserFactory: UpsertUserFactory

    beforeEach(async () => {
        mockUserRepository = {
            add: jest.fn(),
            verifyEmailNoSSO: jest.fn(),
            verifyEmail: jest.fn(),
            updatePassword: jest.fn(),
            searchUser: jest.fn(),
            updateProfile: jest.fn(),
            updateUserStatus: jest.fn(),
            selectById: jest.fn(),
            insertConfirmationEmailSSO: jest.fn(),
            inviteUserNoSSO: jest.fn(),
        }
        mockEmailService = {
            sendPasswordResetConfirmation: jest.fn(),
            sendInviteUserSSO: jest.fn(),
        }

        mockDirectoryUserService = {
            getUserByEmail: jest.fn(),
            getUserList: jest.fn(),
        }
        mockAccessHierarchyService = {
            add: jest.fn(),
            update: jest.fn(),
            selectPermissionByAccessHierarchyId: jest.fn(),
            selectAdminAccessIds: jest.fn(),
            selectAll: jest.fn(),
            delete: jest.fn(),
            select: jest.fn(),
        }
        mockUserFactory = new UpsertUserFactory(mockAccessHierarchyService)

        userService = new UserService(
            mockUserRepository,
            mockEmailService,
            mockDirectoryUserService,
            mockUserFactory,
        )
    })
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
    describe('activate', () => {
        const mockUpdateUserStatusRequest: UserModelDB = {
            id: '123',
            banned_until: null,
            deleted_at: null,
        }
        const mockUpdateUserStatusResponse: PersistenceUpdateUserResponse = {
            userId: '123',
            email: 'any-user-email',
        }
        it('should call userRepository.updateUserStatus with correct values', async () => {
            const sut = mockUserRepository.updateUserStatus.mockResolvedValue(
                mockUpdateUserStatusResponse,
            )
            await userService.activate('123', 'any-auth-token')
            expect(sut).toHaveBeenCalledWith(
                mockUpdateUserStatusRequest,
                'any-auth-token',
            )
        })
        it('should return null if userRepository.updateUserStatus return null', async () => {
            mockUserRepository.updateUserStatus.mockResolvedValue(null)
            const result = await userService.activate('123', 'any-auth-token')
            expect(result).toBeNull()
        })
        it('should return user email if userRepository.updateUserStatus return user', async () => {
            mockUserRepository.updateUserStatus.mockResolvedValue(
                mockUpdateUserStatusResponse,
            )
            const result = await userService.activate('123', 'any-auth-token')
            expect(result).toBe('any-user-email')
        })
        it('should rethrow error if userRepository.updateUserStatus throw', async () => {
            mockUserRepository.updateUserStatus.mockRejectedValue(
                new Error('Error'),
            )
            const promise = userService.activate('123', 'any-auth-token')
            expect(promise).rejects.toThrow(new Error('Error'))
        })
    })
    describe('insertConfirmationEmailSSO', () => {
        const mockInsertConfirmationEmailSSORequest: AddConfirmationEmailSSORequest =
            {
                userId: '123',
                emailConfirmedAt: 'any-email-confirmed-at',
            }
        const mockInsertConfirmationEmailSSOResponse: AddConfirmationEmailSSOResponse =
            {
                id: '123',
                emailExpiradedAt: 'any-email-expiraded-at',
            }
        it('should call userRepository.insertConfirmationEmailSSO with correct values', async () => {
            const sut =
                mockUserRepository.insertConfirmationEmailSSO.mockResolvedValue(
                    mockInsertConfirmationEmailSSOResponse,
                )
            await userService.insertConfirmationEmailSSO(
                mockInsertConfirmationEmailSSORequest,
            )
            expect(sut).toHaveBeenCalledWith(
                mockInsertConfirmationEmailSSORequest,
            )
        })
        it('should return user ID and email expired at if userRepository.insertConfirmationEmailSSO return user ID and email expired at', async () => {
            mockUserRepository.insertConfirmationEmailSSO.mockResolvedValue(
                mockInsertConfirmationEmailSSOResponse,
            )
            const result = await userService.insertConfirmationEmailSSO(
                mockInsertConfirmationEmailSSORequest,
            )
            expect(result).toBe(mockInsertConfirmationEmailSSOResponse)
        })
        it('should rethrow error if userRepository.insertConfirmationEmailSSO throw', async () => {
            mockUserRepository.insertConfirmationEmailSSO.mockRejectedValue(
                new Error('Any error'),
            )
            const promise = userService.insertConfirmationEmailSSO(
                mockInsertConfirmationEmailSSORequest,
            )
            expect(promise).rejects.toThrow(new Error('Any error'))
        })
    })
    describe('inviteUserNoSSO', () => {
        it('should call userRepository.inviteUserNoSSO with correct values', async () => {
            const sut =
                mockUserRepository.inviteUserNoSSO.mockResolvedValue(
                    mockUserResponse,
                )
            await userService.inviteUserNoSSO('any-user-email')
            expect(sut).toHaveBeenCalledWith('any-user-email')
        })
        it('should return user if userRepository.inviteUserNoSSO return user', async () => {
            mockUserRepository.inviteUserNoSSO.mockResolvedValue(
                mockUserResponse,
            )
            const result = await userService.inviteUserNoSSO('any-user-email')
            expect(result).toBe(mockUserResponse)
        })
        it('should return null if userRepository.inviteUserNoSSO return null', async () => {
            mockUserRepository.inviteUserNoSSO.mockResolvedValue(null)
            const result = await userService.inviteUserNoSSO('any-user-email')
            expect(result).toBeNull()
        })
        it('should rethrow error if userRepository.inviteUserNoSSO throw', async () => {
            mockUserRepository.inviteUserNoSSO.mockRejectedValue(
                new Error('Any error'),
            )
            const promise = userService.inviteUserNoSSO('any-user-email')
            expect(promise).rejects.toThrow(new Error('Any error'))
        })
    })
    describe('searchUser', () => {
        const mockSearchUserResponse: FilterSelectUserResponse = {
            id: '123',
            firstName: 'any-first-name',
            lastName: 'any-last-name',
            email: 'any-user-email',
            location: {
                name: 'any-location-name',
                id: 'any-location-id',
            },
            access: {
                name: 'any-access-name',
                id: 'any-access-id',
            },
            status: 'Activated',
            banned: false,
            provider: 'Email',
        }
        it('should call userRepository.searchUser with correct values', async () => {
            const sut = mockUserRepository.searchUser.mockResolvedValue([
                mockSearchUserResponse,
            ])
            await userService.searchUser(
                {
                    term: 'any-term',
                },
                'any-auth-token',
            )
            expect(sut).toHaveBeenCalledWith(
                {
                    term: 'any-term',
                },
                'any-auth-token',
            )
        })
        it('should return user if userRepository.searchUser return user', async () => {
            mockUserRepository.searchUser.mockResolvedValue([
                mockSearchUserResponse,
            ])
            const result = await userService.searchUser(
                { term: 'any-term' },
                'any-auth-token',
            )
            expect(result).toEqual([mockSearchUserResponse])
        })
        it('should return empty array if userRepository.searchUser return empty array', async () => {
            mockUserRepository.searchUser.mockResolvedValue([])
            const result = await userService.searchUser(
                { term: 'any-term' },
                'any-auth-token',
            )
            expect(result).toEqual([])
        })
        it('should rethrow error if userRepository.searchUser throw', async () => {
            mockUserRepository.searchUser.mockRejectedValue(
                new Error('Any error'),
            )
            const promise = userService.searchUser(
                { term: 'any-term' },
                'any-auth-token',
            )
            expect(promise).rejects.toThrow(new Error('Any error'))
        })
    })
    describe('selectByEmail', () => {
        it('should call userRepository.verifyEmailNoSSO with correct values when allUsers is false', async () => {
            const sut =
                mockUserRepository.verifyEmailNoSSO.mockResolvedValue(
                    'any-user-id',
                )
            await userService.selectByEmail('any-user-email', false)
            expect(sut).toHaveBeenCalledWith('any-user-email')
        })
        it('should call userRepository.verifyEmail with correct values when allUsers is true', async () => {
            const sut =
                mockUserRepository.verifyEmail.mockResolvedValue('any-user-id')
            await userService.selectByEmail('any-user-email', true)
            expect(sut).toHaveBeenCalledWith('any-user-email')
        })
        it('should return user id if userRepository.verifyEmailNoSSO return user id', async () => {
            mockUserRepository.verifyEmailNoSSO.mockResolvedValue('any-user-id')
            const result = await userService.selectByEmail(
                'any-user-email',
                false,
            )
            expect(result).toBe('any-user-id')
        })
        it('should return user id if userRepository.verifyEmail return user id', async () => {
            mockUserRepository.verifyEmail.mockResolvedValue('any-user-id')
            const result = await userService.selectByEmail(
                'any-user-email',
                true,
            )
            expect(result).toBe('any-user-id')
        })
        it('should return null if userRepository.verifyEmailNoSSO return null', async () => {
            mockUserRepository.verifyEmailNoSSO.mockResolvedValue(null)
            const result = await userService.selectByEmail(
                'any-user-email',
                false,
            )
            expect(result).toBeNull()
        })
        it('should return null if userRepository.verifyEmail return null', async () => {
            mockUserRepository.verifyEmail.mockResolvedValue(null)
            const result = await userService.selectByEmail(
                'any-user-email',
                true,
            )
            expect(result).toBeNull()
        })
        it('should rethrow error if userRepository.verifyEmailNoSSO throw', async () => {
            mockUserRepository.verifyEmailNoSSO.mockRejectedValue(
                new Error('Any error'),
            )
            const promise = userService.selectByEmail('any-user-email', false)
            expect(promise).rejects.toThrow(new Error('Any error'))
        })
        it('should rethrow error if userRepository.verifyEmail throw', async () => {
            mockUserRepository.verifyEmail.mockRejectedValue(
                new Error('Any error'),
            )
            const promise = userService.selectByEmail('any-user-email', true)
            expect(promise).rejects.toThrow(new Error('Any error'))
        })
    })
    describe('add', () => {
        const mockAddUserRequest: AddUserRequest = {
            email: 'any-user-email',
            firstName: 'any-first-name',
            lastName: 'any-last-name',
            locationId: 'any-location-id',
            useCaseTeamIds: ['any-use-case-team-id'],
            isSSO: true,
            ssoDomain: 'any-sso-domain',
            accessId: 'any-access-id',
            password: 'any-password',
        }
        const mockAddUserResponse: PersistenceAddUserResponse = {
            userId: 'any-user-id',
            email: 'any-user-email',
            code: 'any-jwt-token',
            expiresAt: 'any-expires-at',
        }
        it('should call userRepository.add with correct values when user is admin', async () => {
            mockAccessHierarchyService.selectAdminAccessIds.mockResolvedValue([
                'any-access-id',
            ])
            const {
                useCaseTeamIds,
                ...mockAddUserRequestWithoutUseCaseTeamIds
            } = mockAddUserRequest
            const sut =
                mockUserRepository.add.mockResolvedValue(mockAddUserResponse)
            await userService.add(mockAddUserRequest, 'any-auth-token')
            expect(sut).toHaveBeenCalledWith(
                mockAddUserRequestWithoutUseCaseTeamIds,
                'any-auth-token',
            )
        })
        it('should call userRepository.add with correct values when user is not admin', async () => {
            mockAccessHierarchyService.selectAdminAccessIds.mockResolvedValue(
                [],
            )
            const sut =
                mockUserRepository.add.mockResolvedValue(mockAddUserResponse)
            await userService.add(mockAddUserRequest, 'any-auth-token')
            expect(sut).toHaveBeenCalledWith(
                mockAddUserRequest,
                'any-auth-token',
            )
        })
        it('should call emailService.sendInviteUserSSO with correct values when user is SSO', async () => {
            mockAccessHierarchyService.selectAdminAccessIds.mockResolvedValue(
                [],
            )
            mockUserRepository.add.mockResolvedValue(mockAddUserResponse)
            await userService.add(mockAddUserRequest, 'any-auth-token')
            expect(mockEmailService.sendInviteUserSSO).toHaveBeenCalledWith({
                email: mockAddUserRequest.email,
                code: mockAddUserResponse.code,
                expiresAt: mockAddUserResponse.expiresAt,
            })
        })
        it('should not call emailService.sendInviteUserSSO when user is not SSO', async () => {
            mockAccessHierarchyService.selectAdminAccessIds.mockResolvedValue(
                [],
            )
            mockUserRepository.add.mockResolvedValue(mockAddUserResponse)
            await userService.add(
                { ...mockAddUserRequest, isSSO: false },
                'any-auth-token',
            )
            expect(mockEmailService.sendInviteUserSSO).not.toHaveBeenCalled()
        })
        it('should return correct values if userRepository.add return success', async () => {
            mockAccessHierarchyService.selectAdminAccessIds.mockResolvedValue(
                [],
            )
            mockUserRepository.add.mockResolvedValue(mockAddUserResponse)
            const result = await userService.add(
                mockAddUserRequest,
                'any-auth-token',
            )
            expect(result).toEqual({
                userId: mockAddUserResponse.userId,
                email: mockAddUserResponse.email,
            })
        })
        it('should return null if userRepository.add return null', async () => {
            mockAccessHierarchyService.selectAdminAccessIds.mockResolvedValue(
                [],
            )
            mockUserRepository.add.mockResolvedValue(null)
            const result = await userService.add(
                mockAddUserRequest,
                'any-auth-token',
            )
            expect(result).toBeNull()
        })
        it('should rethrow error if userRepository.add throw', async () => {
            mockAccessHierarchyService.selectAdminAccessIds.mockResolvedValue(
                [],
            )
            mockUserRepository.add.mockRejectedValue(new Error('Any error'))
        })
    })
    describe('updatePassword', () => {
        const mockUpdatePasswordRequest: ResetPasswordRequest = {
            password: 'any-password',
            confirmPassword: 'any-password',
            accessToken: 'any-access-token',
            refreshToken: 'any-refresh-token',
        }
        it('should call userRepository.updatePassword with correct values', async () => {
            const sut =
                mockUserRepository.updatePassword.mockResolvedValue(
                    mockUserResponse,
                )
            await userService.updatePassword(mockUpdatePasswordRequest)
            expect(sut).toHaveBeenCalledWith(mockUpdatePasswordRequest)
        })
        it('should return user if userRepository.updatePassword return user', async () => {
            mockUserRepository.updatePassword.mockResolvedValue(
                mockUserResponse,
            )
            const result = await userService.updatePassword(
                mockUpdatePasswordRequest,
            )
            expect(result).toEqual(mockUserResponse)
        })
        it('should return null if userRepository.updatePassword return null', async () => {
            mockUserRepository.updatePassword.mockResolvedValue(null)
            const result = await userService.updatePassword(
                mockUpdatePasswordRequest,
            )
            expect(result).toBeNull()
        })
        it('should rethrow error if userRepository.updatePassword throw', async () => {
            mockUserRepository.updatePassword.mockRejectedValue(
                new Error('Any error'),
            )
            const promise = userService.updatePassword(
                mockUpdatePasswordRequest,
            )
            expect(promise).rejects.toThrow(new Error('Any error'))
        })
    })
    describe('update', () => {
        const mockUpdateUserRequest: UpdateUserRequest = {
            id: 'any-user-id',
            firstName: 'any-first-name',
            lastName: 'any-last-name',
            email: 'any-user-email',
            accessId: 'any-access-id',
            locationId: 'any-location-id',
            useCaseTeamIds: ['any-use-case-team-id'],
        }
        const mockUpdateUserResponse: PersistenceUpdateUserResponse = {
            userId: 'any-user-id',
            email: 'any-user-email',
        }
        it('should call userRepository.update with correct values when user is  not admin', async () => {
            mockAccessHierarchyService.selectAdminAccessIds.mockResolvedValue(
                [],
            )
            const sut = mockUserRepository.updateProfile.mockResolvedValue(
                mockUpdateUserResponse,
            )
            await userService.update(mockUpdateUserRequest, 'any-auth-token')
            expect(sut).toHaveBeenCalledWith(
                mockUpdateUserRequest,
                'any-auth-token',
            )
        })
        it('should call userRepository.update with correct values when user is admin', async () => {
            mockAccessHierarchyService.selectAdminAccessIds.mockResolvedValue([
                'any-access-id',
            ])
            const {
                useCaseTeamIds,
                ...mockUpdateUserRequestWithoutUseCaseTeamIds
            } = mockUpdateUserRequest
            const sut = mockUserRepository.updateProfile.mockResolvedValue(
                mockUpdateUserResponse,
            )
            await userService.update(mockUpdateUserRequest, 'any-auth-token')
            expect(sut).toHaveBeenCalledWith(
                mockUpdateUserRequestWithoutUseCaseTeamIds,
                'any-auth-token',
            )
        })
        it('should return user if userRepository.update return success', async () => {
            mockAccessHierarchyService.selectAdminAccessIds.mockResolvedValue(
                [],
            )
            mockUserRepository.updateProfile.mockResolvedValue(
                mockUpdateUserResponse,
            )
            const result = await userService.update(
                mockUpdateUserRequest,
                'any-auth-token',
            )
            expect(result).toEqual(mockUpdateUserResponse)
        })
        it('should return null if userRepository.update return null', async () => {
            mockAccessHierarchyService.selectAdminAccessIds.mockResolvedValue(
                [],
            )
            mockUserRepository.updateProfile.mockResolvedValue(null)
            const result = await userService.update(
                mockUpdateUserRequest,
                'any-auth-token',
            )
            expect(result).toBeNull()
        })
        it('should rethrow error if userRepository.update throw', async () => {
            mockAccessHierarchyService.selectAdminAccessIds.mockResolvedValue(
                [],
            )
            mockUserRepository.updateProfile.mockRejectedValue(
                new Error('Any error'),
            )
            const promise = userService.update(
                mockUpdateUserRequest,
                'any-auth-token',
            )
            expect(promise).rejects.toThrow(new Error('Any error'))
        })
    })
    describe('delete', () => {
        const mockDeleteUserResponse: PersistenceUpdateUserResponse = {
            userId: 'any-user-id',
            email: 'any-user-email',
        }

        let originalDate: DateConstructor
        let mockDate: Date

        beforeEach(() => {
            originalDate = global.Date

            mockDate = new Date(2023, 0, 1, 12, 0, 0)

            global.Date = jest.fn(() => mockDate) as any

            global.Date.now = jest.fn(() => mockDate.getTime())
            ;(global.Date as any).UTC = originalDate.UTC
            mockDate.toISOString = jest.fn(() => '2023-01-01T12:00:00.000Z')
        })

        afterEach(() => {
            global.Date = originalDate
        })
        it('should call userRepository.updateUserStatus with correct values', async () => {
            const sut = mockUserRepository.updateUserStatus.mockResolvedValue(
                mockDeleteUserResponse,
            )
            await userService.delete('any-user-id', 'any-auth-token')
            expect(sut).toHaveBeenCalledWith(
                {
                    id: 'any-user-id',
                    banned_until: mockDate.toISOString(),
                    deleted_at: mockDate.toISOString(),
                },
                'any-auth-token',
            )
        })
        it('should return user email if userRepository.updateUserStatus return success', async () => {
            mockUserRepository.updateUserStatus.mockResolvedValue(
                mockDeleteUserResponse,
            )
            const result = await userService.delete(
                'any-user-id',
                'any-auth-token',
            )
            expect(result).toEqual(mockDeleteUserResponse.email)
        })
        it('should return null if userRepository.updateUserStatus return null', async () => {
            mockUserRepository.updateUserStatus.mockResolvedValue(null)
            const result = await userService.delete(
                'any-user-id',
                'any-auth-token',
            )
            expect(result).toBeNull()
        })
        it('should rethrow error if userRepository.updateUserStatus throw', async () => {
            mockUserRepository.updateUserStatus.mockRejectedValue(
                new Error('Any error'),
            )
            const promise = userService.delete('any-user-id', 'any-auth-token')
            expect(promise).rejects.toThrow(new Error('Any error'))
        })
    })
    describe('select', () => {
        const mockSelectUserResponse: FilterSelectUserResponse = {
            id: 'any-user-id',
            firstName: 'any-first-name',
            lastName: 'any-last-name',
            email: 'any-user-email',
            location: {
                name: 'any-city, any-state, any-country',
                id: 'any-location-id',
            },
            access: {
                name: 'any-access-name',
                id: 'any-access-id',
            },
            status: 'Activated',
            banned: false,
            provider: 'Email',
            useCaseTeams: [],
        }

        it('should call userRepository.select with correct values', async () => {
            const sut = mockUserRepository.selectById.mockResolvedValue(
                mockSelectUserResponse,
            )
            await userService.select({
                id: 'any-user-id',
                token: 'any-auth-token',
            })
            expect(sut).toHaveBeenCalledWith({
                id: 'any-user-id',
                token: 'any-auth-token',
            })
        })
        it('should return user if userRepository.select return success', async () => {
            mockUserRepository.selectById.mockResolvedValue({
                id: 'any-user-id',
                first_name: 'any-first-name',
                last_name: 'any-last-name',
                access: {
                    id: 'any-access-id',
                    name: 'any-access-name',
                    created_at: 'any-created-at',
                    description: 'any-description',
                },
                location: {
                    id: 'any-location-id',
                    city: 'any-city',
                    state: 'any-state',
                    country: 'any-country',
                },
                use_case_teams: [],
                email: 'any-user-email',
                is_sso_user: false,
                deleted_at: null,
                banned_until: null,
                email_confirmed_at: 'any-email-confirmed-at',
            })
            const result = await userService.select({
                id: 'any-user-id',
                token: 'any-auth-token',
            })
            expect(result).toEqual(mockSelectUserResponse)
        })
        it('should return null if userRepository.select return null', async () => {
            mockUserRepository.selectById.mockResolvedValue(null)
            const result = await userService.select({
                id: 'any-user-id',
                token: 'any-auth-token',
            })
            expect(result).toBeNull()
        })
        it('should rethrow error if userRepository.select throw', async () => {
            mockUserRepository.selectById.mockRejectedValue(
                new Error('Any error'),
            )
            const promise = userService.select({
                id: 'any-user-id',
                token: 'any-auth-token',
            })
            expect(promise).rejects.toThrow(new Error('Any error'))
        })
    })
})
