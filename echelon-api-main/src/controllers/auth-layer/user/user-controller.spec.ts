import { IUserService } from 'src/domain/interfaces/services/auth-layer/users/i-user-service'
import { UsersController } from './user-controller'
import { Test } from '@nestjs/testing'
import { TestingModule } from '@nestjs/testing'
import { JwtService } from '@nestjs/jwt'
import { AddUserRequest } from 'src/domain/auth-layer/user/request/add-user-request'
import { PersistenceAddUserResponse } from 'src/domain/auth-layer/user/response/persistence-add-user-response'
import { IAuthCustomRequest } from 'src/controllers/http-helpers/auth-custom-request'
import { HttpException, HttpStatus } from '@nestjs/common'
import { ResetPasswordRequest } from 'src/domain/auth-layer/auth/request/reset-password-request'
import { User } from '@supabase/supabase-js'
import { FilterSelectUserResponse } from 'src/domain/auth-layer/user/response/filter-select-user-response'
import { ILoggerService } from 'src/shared/services/interfaces/i-logger-service'
import { IHistoryService } from 'src/services/auth-layer/history/i-history-service'
describe('UserController', () => {
    let usersController: UsersController
    let mockUserService: jest.Mocked<IUserService>
    let mockLoggerService: jest.Mocked<ILoggerService>
    let mockHistoryService: jest.Mocked<IHistoryService>
    beforeEach(async () => {
        mockUserService = {
            add: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            selectAll: jest.fn(),
            select: jest.fn(),
            updatePassword: jest.fn(),
            searchUser: jest.fn(),
            activate: jest.fn(),
            deactivate: jest.fn(),
        } as any
        mockHistoryService = {
            createHistory: jest.fn(),
        } as any
        mockLoggerService = {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
        } as any
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UsersController],
            providers: [
                { provide: 'IUserService', useValue: mockUserService },
                {
                    provide: JwtService,
                    useValue: {
                        verifyAsync: jest.fn(),
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
            exports: ['IUserService'],
        }).compile()

        usersController = module.get<UsersController>(UsersController)
    })

    it('should be defined', () => {
        expect(usersController).toBeDefined()
    })

    const mockUser: User = {
        id: '123',
        app_metadata: {
            provider: 'email',
        },
        user_metadata: {},
        aud: '123',
        created_at: '2021-01-01',
        confirmed_at: '2021-01-01',
    }
    const mockAuthRequest: IAuthCustomRequest = {
        authToken: '123',
        user: {
            email: 'test@example.com',
            profile: {
                first_name: 'Test',
                last_name: 'User',
                access_id: '123',
                access_name: 'Test User',
            },
            session_id: '123',
            user_id: '123',
            user_permissions: [],
            access_id: '123',
        },
    } as any
    const mockUserResponse: FilterSelectUserResponse = {
        id: '123',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        location: {
            name: 'Test Location',
            id: '123',
        },
        access: {
            name: 'Test Access',
            id: '123',
        },
        status: 'Activated',
        banned: false,
        provider: 'Email',
    }
    describe('post', () => {
        const mockUser: AddUserRequest = {
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            accessId: '123',
        }

        const mockResponse: PersistenceAddUserResponse = {
            email: 'test@example.com',
            userId: '123',
        }

        it('should call userService.add with correct values', async () => {
            const sut = mockUserService.add.mockResolvedValue(mockResponse)
            await usersController.post(mockUser, mockAuthRequest)
            expect(sut).toHaveBeenCalledWith(
                mockUser,
                mockAuthRequest.authToken,
            )
        })
        it('should return data response and status 200 when add user success', async () => {
            mockUserService.add.mockResolvedValue(mockResponse)
            const response = await usersController.post(
                mockUser,
                mockAuthRequest,
            )
            expect(response.statusCode).toEqual(200)
            expect(response.data).toEqual({
                email: mockResponse.email,
                userId: mockResponse.userId,
            })
        })
        it('should throw HttpException when add user return null', async () => {
            mockUserService.add.mockResolvedValue(null)
            await expect(
                usersController.post(mockUser, mockAuthRequest),
            ).rejects.toThrow(HttpException)
        })

        it('should throw HttpException when add user throw error', async () => {
            mockUserService.add.mockRejectedValue(
                new HttpException(
                    'Any error message',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                ),
            )
            await expect(
                usersController.post(mockUser, mockAuthRequest),
            ).rejects.toThrow(HttpException)
        })
    })
    describe('updatePassword', () => {
        const mockResetPasswordRequest: ResetPasswordRequest = {
            password: 'new-password',
            confirmPassword: 'new-password',
            accessToken: 'any-access-token',
            refreshToken: 'any-refresh-token',
        }

        it('should call userService.updatePassword with correct values', async () => {
            const sut =
                mockUserService.updatePassword.mockResolvedValue(mockUser)
            await usersController.updatePassword(mockResetPasswordRequest)
            expect(sut).toHaveBeenCalledWith(mockResetPasswordRequest)
        })
        it('should return data response and status 200 when update password success', async () => {
            mockUserService.updatePassword.mockResolvedValue(mockUser)
            const response = await usersController.updatePassword(
                mockResetPasswordRequest,
            )
            expect(response.statusCode).toEqual(200)
            expect(response.data).toEqual({
                passwordUpdate: true,
                message: 'Password created successfully',
            })
        })
        it('should throw HttpException when update password return null', async () => {
            mockUserService.updatePassword.mockResolvedValue(null)
            await expect(
                usersController.updatePassword(mockResetPasswordRequest),
            ).rejects.toThrow(HttpException)
        })
        it('should throw HttpException when update password throw error', async () => {
            mockUserService.updatePassword.mockRejectedValue(
                new HttpException(
                    'Any error message',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                ),
            )
            await expect(
                usersController.updatePassword(mockResetPasswordRequest),
            ).rejects.toThrow(HttpException)
        })
    })
    // describe('getAll', () => {
    //     it('should call userService.selectAll with correct values', async () => {
    //         const sut = mockUserService.selectAll.mockResolvedValue([
    //             {
    //                 any: 'any',
    //             },
    //         ])
    //         await usersController.getAll({
    //             any: 'any',
    //         })
    //         expect(sut).toHaveBeenCalledWith({
    //             any: 'any',
    //         })
    //     })
    //     it('should return null when selectAll return null', async () => {
    //         mockUserService.selectAll.mockResolvedValue(null)
    //         const response = await usersController.getAll({
    //             any: 'any',
    //         })
    //         expect(response.statusCode).toEqual(200)
    //         expect(response.data).toEqual(null)
    //     })
    //     it('should return data response and status 200 when selectAll success', async () => {
    //         mockUserService.selectAll.mockResolvedValue([
    //             {
    //                 any: 'any',
    //             },
    //         ])
    //         const response = await usersController.getAll({
    //             any: 'any',
    //         })
    //         expect(response.statusCode).toEqual(200)
    //         expect(response.data).toEqual([{ any: 'any' }])
    //     })
    //     it('should throw HttpException when selectAll throw error', async () => {
    //         mockUserService.selectAll.mockRejectedValue(
    //             new HttpException(
    //                 'Any error message',
    //                 HttpStatus.INTERNAL_SERVER_ERROR,
    //             ),
    //         )
    //         await expect(
    //             usersController.getAll({ any: 'any' }),
    //         ).rejects.toThrow(HttpException)
    //     })
    // })
    describe('get', () => {
        it('should call userService.select with correct values', async () => {
            const sut =
                mockUserService.select.mockResolvedValue(mockUserResponse)
            await usersController.get('123', mockAuthRequest)
            expect(sut).toHaveBeenCalledWith({
                id: '123',
                token: mockAuthRequest.authToken,
            })
        })
        it('should throw HttpException when select return null', async () => {
            mockUserService.select.mockResolvedValue(null)
            await expect(
                usersController.get('123', mockAuthRequest),
            ).rejects.toThrow(HttpException)
        })
        it('should return data response and status 200 when select success', async () => {
            mockUserService.select.mockResolvedValue(mockUserResponse)
            const response = await usersController.get('123', mockAuthRequest)
            expect(response.statusCode).toEqual(200)
            expect(response.data).toEqual(mockUserResponse)
        })
        it('should throw HttpException when select throw error', async () => {
            mockUserService.select.mockRejectedValue(
                new HttpException(
                    'Any error message',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                ),
            )
            await expect(
                usersController.get('123', mockAuthRequest),
            ).rejects.toThrow(HttpException)
        })
    })
    describe('search', () => {
        it('should call userService.searchUser with correct values', async () => {
            const sut = mockUserService.searchUser.mockResolvedValue([
                mockUserResponse,
            ])
            await usersController.search({ term: 'test' }, mockAuthRequest)
            expect(sut).toHaveBeenCalledWith(
                { term: 'test' },
                mockAuthRequest.authToken,
            )
        })
        it('should return data response and status 200 when searchUser success', async () => {
            mockUserService.searchUser.mockResolvedValue([mockUserResponse])
            const response = await usersController.search(
                { term: 'test' },
                mockAuthRequest,
            )
            expect(response.statusCode).toEqual(200)
            expect(response.data).toEqual([mockUserResponse])
        })
        it('should return empty array when searchUser return null', async () => {
            mockUserService.searchUser.mockResolvedValue([])
            const response = await usersController.search(
                { term: 'test' },
                mockAuthRequest,
            )
            expect(response.statusCode).toEqual(200)
            expect(response.data).toEqual([])
        })
        it('should throw HttpException when searchUser throw error', async () => {
            mockUserService.searchUser.mockRejectedValue(
                new HttpException(
                    'Any error message',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                ),
            )
            await expect(
                usersController.search({ term: 'test' }, mockAuthRequest),
            ).rejects.toThrow(HttpException)
        })
    })
    describe('activate', () => {
        it('should call userService.activate with correct values', async () => {
            const sut = mockUserService.activate.mockResolvedValue('any')
            await usersController.activate('123', mockAuthRequest)
            expect(sut).toHaveBeenCalledWith('123', mockAuthRequest.authToken)
        })
        it('should return data response and status 200 when activate success', async () => {
            mockUserService.activate.mockResolvedValue('any-user-email')
            const response = await usersController.activate(
                '123',
                mockAuthRequest,
            )
            expect(response.statusCode).toEqual(200)
            expect(response.data).toEqual('User: any-user-email activated')
        })
        it('should throw HttpException when activate return null', async () => {
            mockUserService.activate.mockResolvedValue(null)
            await expect(
                usersController.activate('123', mockAuthRequest),
            ).rejects.toThrow(HttpException)
        })
        it('should throw HttpException when activate throw error', async () => {
            mockUserService.activate.mockRejectedValue(
                new HttpException(
                    'Any error message',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                ),
            )
            await expect(
                usersController.activate('123', mockAuthRequest),
            ).rejects.toThrow(HttpException)
        })
    })
    describe('delete', () => {
        it('should call userService.delete with correct values', async () => {
            const sut =
                mockUserService.delete.mockResolvedValue('any-user-email')
            await usersController.delete('123', mockAuthRequest)
            expect(sut).toHaveBeenCalledWith('123', mockAuthRequest.authToken)
        })
        it('should return data response and status 200 when delete success', async () => {
            mockUserService.delete.mockResolvedValue('any-user-email')
            const response = await usersController.delete(
                '123',
                mockAuthRequest,
            )
            expect(response.statusCode).toEqual(200)
            expect(response.data).toEqual('User: any-user-email deactivated')
        })
        it('should throw HttpException when delete return null', async () => {
            mockUserService.delete.mockResolvedValue(null)
            await expect(
                usersController.delete('123', mockAuthRequest),
            ).rejects.toThrow(HttpException)
        })
        it('should throw HttpException when delete throw error', async () => {
            mockUserService.delete.mockRejectedValue(
                new HttpException(
                    'Any error message',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                ),
            )
            await expect(
                usersController.delete('123', mockAuthRequest),
            ).rejects.toThrow(HttpException)
        })
    })
})
