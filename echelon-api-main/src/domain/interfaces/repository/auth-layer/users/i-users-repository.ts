import { User } from '@supabase/supabase-js'
import { ResetPasswordRequest } from 'src/domain/auth-layer/auth/request'
import { UserModelDB } from 'src/domain/auth-layer/user/model'
import {
    AddConfirmationEmailSSORequest,
    AddUserRequest,
    FilterSelectUserRequest,
    SearchUserRequest,
    UpdateUserRequest,
} from 'src/domain/auth-layer/user/request'
import {
    AddConfirmationEmailSSOResponse,
    PersistenceAddUserResponse,
    PersistenceUpdateUserResponse,
} from 'src/domain/auth-layer/user/response'
import { FilterSelectUserResponse } from 'src/domain/auth-layer/user/response/filter-select-user-response'

export interface IUsersRepository {
    add(
        entity: AddUserRequest,
        token: string,
    ): Promise<PersistenceAddUserResponse | null>
    verifyEmailNoSSO(email: string): Promise<string | null>
    verifyEmail(email: string): Promise<string | null>
    updatePassword({
        password,
        accessToken,
        refreshToken,
    }: ResetPasswordRequest): Promise<User | null>
    searchUser(
        params: SearchUserRequest,
        token: string,
    ): Promise<FilterSelectUserResponse[]>
    updateProfile(
        data: UpdateUserRequest,
        token: string,
    ): Promise<PersistenceUpdateUserResponse | null>
    updateUserStatus(
        data: UserModelDB,
        token: string,
    ): Promise<PersistenceUpdateUserResponse | null>
    selectById({ id, token }: FilterSelectUserRequest): Promise<any | null>
    insertConfirmationEmailSSO(
        data: AddConfirmationEmailSSORequest,
    ): Promise<AddConfirmationEmailSSOResponse>
    inviteUserNoSSO(email: string): Promise<User | null>
}
