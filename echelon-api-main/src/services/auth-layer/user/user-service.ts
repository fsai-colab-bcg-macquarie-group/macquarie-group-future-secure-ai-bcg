import { Inject, MethodNotAllowedException } from '@nestjs/common'
import { User } from '@supabase/supabase-js'
import { env } from 'src/config/env'
import { LoginMethodType } from 'src/domain/auth-layer/auth/enum'
import { ResetPasswordRequest } from 'src/domain/auth-layer/auth/request'
import { UserModel } from 'src/domain/auth-layer/user/model'
import {
    AddUserRequest,
    UpdateUserRequest,
    FiltersSelectAllUsersRequest,
    SearchUserRequest,
    FilterSelectUserRequest,
    AddConfirmationEmailSSORequest,
} from 'src/domain/auth-layer/user/request'
import {
    PersistenceAddUserResponse,
    FiltersSelectAllUsersResponse,
    PersistenceUpdateUserResponse,
    AddConfirmationEmailSSOResponse,
} from 'src/domain/auth-layer/user/response'
import { FilterSelectUserResponse } from 'src/domain/auth-layer/user/response/filter-select-user-response'
import { IUsersRepository } from 'src/domain/interfaces/repository/auth-layer/users/i-users-repository'
import IDirectoryUserService from 'src/domain/interfaces/services/auth-layer/directory-user/i-directory-user-service'
import { IUserService } from 'src/domain/interfaces/services/auth-layer/users'
import { IEMailNotificationService } from 'src/shared/services/interfaces/notification'
import JwtUtils from 'src/utils/jwt-utils'
import { UpsertUserFactory } from './factory-upsert-user'

export class UserService implements IUserService {
    constructor(
        @Inject('IUsersRepository')
        private readonly usersRepository: IUsersRepository,
        @Inject('IEMailNotificationService')
        private readonly emailService: IEMailNotificationService,
        @Inject('IDirectoryUserService')
        private readonly directoryUserService: IDirectoryUserService,
        private readonly userFactory: UpsertUserFactory,
    ) {}

    async activate(id: number | string, token: string): Promise<string | null> {
        const user = await this.usersRepository.updateUserStatus(
            {
                id,
                banned_until: null,
                deleted_at: null,
            },
            token,
        )
        if (!user) {
            return null
        }
        return user.email
    }

    async insertConfirmationEmailSSO(
        data: AddConfirmationEmailSSORequest,
    ): Promise<AddConfirmationEmailSSOResponse> {
        return await this.usersRepository.insertConfirmationEmailSSO(data)
    }

    async inviteUserNoSSO(email: string): Promise<User | null> {
        return await this.usersRepository.inviteUserNoSSO(email)
    }

    async searchUser(
        params: SearchUserRequest,
        token: string,
    ): Promise<FilterSelectUserResponse[]> {
        const response = await this.usersRepository.searchUser(params, token)
        return response
    }

    async selectByEmail(
        email: string,
        allUsers: boolean,
    ): Promise<string | null> {
        if (allUsers) {
            return await this.usersRepository.verifyEmail(email)
        }
        return await this.usersRepository.verifyEmailNoSSO(email)
    }

    async add(
        entity: AddUserRequest,
        token: string,
    ): Promise<PersistenceAddUserResponse | null> {
        const userToSave = await this.userFactory.createUser(entity)
        const userAD = await this.directoryUserService.getUserByEmail(
            userToSave.email,
        )

        if (userAD || entity.isSSO) {
            const user = await this.usersRepository.add(
                { ...userToSave, isSSO: true },
                token,
            )
            if (!user?.code || !user?.expiresAt) {
                return null
            }
            const jwtToken = JwtUtils.generateJWTToken({
                code: user.code,
                secret: env.JWT_SECRET!,
                expiresIn: Number(env.TIME_EXPIRATION_CONFIRMED_EMAIL),
            })
            await this.emailService.sendInviteUserSSO({
                email: user.email,
                code: jwtToken,
                expiresAt: user.expiresAt,
            })
            return {
                userId: user.userId,
                email: user.email,
            }
        }
        return await this.usersRepository.add(
            { ...userToSave, isSSO: false },
            token,
        )
    }

    async updatePassword(data: ResetPasswordRequest): Promise<User | null> {
        if (
            env.SIGN_IN_METHOD !== LoginMethodType.BOTH &&
            env.SIGN_IN_METHOD !== LoginMethodType.REGULAR
        )
            throw new MethodNotAllowedException(
                'This login method is disabled, try using SSO method.',
            )

        const userData = await this.usersRepository.updatePassword(data)
        if (!userData?.email) {
            return null
        }

        return userData
    }

    async update(
        data: UpdateUserRequest,
        token: string,
    ): Promise<PersistenceUpdateUserResponse | null> {
        const userToSave = await this.userFactory.updateUser(data)
        const userData = await this.usersRepository.updateProfile(
            userToSave,
            token,
        )

        if (!userData) {
            return null
        }

        return userData
    }

    async delete(id: number | string, token: string): Promise<string | null> {
        // Set a future date far in the future to mark the user as banned until this date
        const currentYear = new Date().getUTCFullYear()
        const futureDate = new Date(Date.UTC(currentYear + 100, 0, 1, 12, 0, 0))
        const user = await this.usersRepository.updateUserStatus(
            {
                id,
                banned_until: futureDate.toISOString(),
                deleted_at: new Date().toISOString(),
            },
            token,
        )
        if (!user) {
            return null
        }
        return user.email
    }
    async select({
        id,
        token,
    }: FilterSelectUserRequest): Promise<FilterSelectUserResponse | null> {
        const result = await this.usersRepository.selectById({ id, token })
        if (!result) {
            return null
        }
        return UserModel.fromSelectUserResponse(result)
    }

    selectAll(
        _entity: FiltersSelectAllUsersRequest,
    ): Promise<FiltersSelectAllUsersResponse[] | null> {
        throw new Error('Method not implemented.')
    }
}
