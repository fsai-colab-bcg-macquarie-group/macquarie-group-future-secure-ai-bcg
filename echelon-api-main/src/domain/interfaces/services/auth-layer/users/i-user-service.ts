import { User } from '@supabase/supabase-js'
import { ResetPasswordRequest } from 'src/domain/auth-layer/auth/request'
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
import { IPersistenceBase } from 'src/services/interfaces/generic/i-persistence-base'

export interface IUserService
    extends IPersistenceBase<
        AddUserRequest,
        PersistenceAddUserResponse | null,
        UpdateUserRequest,
        PersistenceUpdateUserResponse | null,
        FilterSelectUserRequest,
        FilterSelectUserResponse,
        FiltersSelectAllUsersRequest,
        FiltersSelectAllUsersResponse
    > {
    selectByEmail(email: string, allUsers: boolean): Promise<string | null>
    updatePassword(data: ResetPasswordRequest): Promise<User | null>
    searchUser(
        param: SearchUserRequest,
        token: string,
    ): Promise<FilterSelectUserResponse[]>
    insertConfirmationEmailSSO(
        data: AddConfirmationEmailSSORequest,
    ): Promise<AddConfirmationEmailSSOResponse>
    inviteUserNoSSO(email: string): Promise<User | null>
    activate(id: number | string, token: string): Promise<string | null>
}
