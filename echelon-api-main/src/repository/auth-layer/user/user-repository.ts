import { BadRequestException, ConflictException } from '@nestjs/common'
import { SupabaseClient, createClient, User } from '@supabase/supabase-js'
import { env } from 'src/config/env'
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
import { IUsersRepository } from 'src/domain/interfaces/repository/auth-layer/users/i-users-repository'
import { throwHttpException, formatExpirationTime } from 'src/utils'

export class UsersRepository implements IUsersRepository {
    private readonly supabase: SupabaseClient
    private readonly supabaseUrl: string
    private readonly supabaseClient: string

    constructor() {
        ;(this.supabaseUrl = env.SUPABASE_URL || ''),
            (this.supabaseClient = env.SUPABASE_SERVICE_ROLE_KEY || ''),
            (this.supabase = createClient(
                this.supabaseUrl,
                this.supabaseClient,
            ))
    }

    async insertConfirmationEmailSSO({
        userId,
        emailConfirmedAt,
    }: AddConfirmationEmailSSORequest): Promise<AddConfirmationEmailSSOResponse> {
        const { data, error } = await this.supabase
            .schema('auth_layer')
            .from('confirmation_email_sso')
            .insert([{ user_id: userId, email_expiraded_at: emailConfirmedAt }])
            .select('id, email_expiraded_at')
            .single()

        if (error || !data) {
            throwHttpException(error.message, error.code)
        }

        return {
            id: data.id,
            emailExpiradedAt: data.email_expiraded_at,
        }
    }

    async inviteUserNoSSO(email: string): Promise<User | null> {
        const { data, error } =
            await this.supabase.auth.admin.inviteUserByEmail(email, {
                redirectTo: `${env.SITE_URL}/third-party`,
            })

        if (error) {
            throwHttpException(error.message, error.code)
        }

        return data.user
    }

    private createAuthenticatedClient(token: string): SupabaseClient {
        return createClient(this.supabaseUrl, this.supabaseClient, {
            global: {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        })
    }

    async selectById({
        id,
        token,
    }: FilterSelectUserRequest): Promise<any | null> {
        const supabase = this.createAuthenticatedClient(token)
        const { data: userProfile, error: errorUserProfile } = await supabase
            .schema('auth_layer')
            .rpc('get_user_detail_by_id', {
                userid: id,
            })

        if (errorUserProfile) {
            throwHttpException(errorUserProfile.message, errorUserProfile.code)
        }

        if (!Array.isArray(userProfile) || userProfile.length === 0) {
            return null
        }

        return userProfile[0]
    }

    async searchUser(
        term: SearchUserRequest,
        token: string,
    ): Promise<FilterSelectUserResponse[]> {
        const supabase = this.createAuthenticatedClient(token)
        const { data, error } = await supabase
            .schema('auth_layer')
            .rpc('search_users', {
                search_term: term,
            })

        if (error) {
            throwHttpException(error.message, error.code)
        }
        return data.map((user: any) => ({
            userId: user.user_id,
            firstName: user.first_name,
            lastName: user.last_name,
            email: user.email,
        }))
    }

    async verifyEmailNoSSO(email: string): Promise<string | null> {
        const { data, error } = await this.supabase
            .schema('auth')
            .from('users')
            .select('id')
            .eq('email', email)
            .eq('is_sso_user', false)
            .maybeSingle()

        if (error) {
            throwHttpException(error.message, error.code)
        }

        if (!data) {
            return null
        }

        return data.id
    }

    async add(
        entity: AddUserRequest,
        token: string,
    ): Promise<PersistenceAddUserResponse | null> {
        let user: { userId: string; email: string } | User | null

        if (entity.isSSO) {
            user = await this.createSSOUser(entity, token)
            if (!user) {
                return null
            }

            const emailConfirmedAt = formatExpirationTime(
                env.TIME_EXPIRATION_CONFIRMED_EMAIL,
            )
            const confirmationEmail = await this.insertConfirmationEmailSSO({
                userId: user.userId,
                emailConfirmedAt,
            })
            return {
                email: entity.email,
                userId: user.userId,
                code: confirmationEmail.id,
                expiresAt: confirmationEmail.emailExpiradedAt,
            }
        } else {
            const emailExist = await this.verifyEmail(entity.email)
            if (emailExist) {
                throw new ConflictException(
                    `An account with the email address ${entity.email} already exists.`,
                )
            }
            const user = await this.inviteUserNoSSO(entity.email)
            if (!user) {
                return null
            }
            if (!user) {
                return null
            }
            const { isUpsert, message } = await this.upsertUserProfile(
                {
                    id: user.id,
                    firstName: entity.firstName,
                    lastName: entity.lastName,
                    email: entity.email,
                    accessId: entity.accessId,
                    useCaseTeamIds: entity.useCaseTeamIds,
                    locationId: entity.locationId,
                },
                token,
            )
            if (!isUpsert) {
                await this.supabase
                    .schema('auth')
                    .from('users')
                    .delete()
                    .eq('email', entity.email)
                    .maybeSingle()

                throw new BadRequestException(message)
            }
            return { email: entity.email, userId: user.id }
        }
    }

    async updatePassword({
        password,
        accessToken,
        refreshToken,
    }: ResetPasswordRequest): Promise<User | null> {
        await this.supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
        })

        const {
            data: { user },
            error,
        } = await this.supabase.auth.updateUser({
            password,
        })
        if (error) {
            throwHttpException(error.message, error.code, error.status)
        }
        const { error: errorCloseSession } = await this.supabase.auth.signOut()
        if (errorCloseSession) {
            throwHttpException(
                errorCloseSession.message,
                errorCloseSession.code,
                errorCloseSession.status,
            )
        }

        if (!user) {
            return null
        }
        return user
    }

    async verifyEmail(email: string): Promise<string | null> {
        const { data, error: userExistsError } = await this.supabase
            .schema('auth')
            .from('users')
            .select('id')
            .eq('email', email)
            .maybeSingle()
        if (userExistsError) {
            throwHttpException(userExistsError.message, userExistsError.code)
        }

        if (!data) {
            return null
        }

        return data.id
    }
    async updateProfile(
        userData: UpdateUserRequest,
        token: string,
    ): Promise<PersistenceAddUserResponse | null> {
        const { isUpsert, message } = await this.upsertUserProfile(
            {
                id: userData.id,
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                accessId: userData.accessId,
                useCaseTeamIds: userData.useCaseTeamIds,
                locationId: userData.locationId,
            },
            token,
        )
        if (!isUpsert) {
            throw new BadRequestException(message)
        }
        return {
            userId: userData.id as string,
            email: userData.email as string,
        }
    }

    async updateUserStatus(
        userData: UserModelDB,
        token: string,
    ): Promise<PersistenceUpdateUserResponse | null> {
        const supabase = this.createAuthenticatedClient(token)

        const { data, error } = await supabase
            .schema('auth')
            .from('users')
            .update(userData)
            .eq('id', userData.id)
            .select('id, email')
            .single()

        if (error) {
            throwHttpException(error.message, error.code)
        }

        if (!data) {
            return null
        }
        return {
            userId: data.id,
            email: data.email,
        }
    }

    private async upsertUserProfile(
        entity: UpdateUserRequest,
        token: string,
    ): Promise<{ isUpsert: boolean; message: string }> {
        const supabase = this.createAuthenticatedClient(token)
        const supabaseData = await supabase
            .schema('auth_layer')
            .rpc('upsert_user_profile', {
                user_id_param: entity.id,
                first_name: entity.firstName,
                last_name: entity.lastName,
                access_id: entity.accessId,
                use_case_team_ids: entity.useCaseTeamIds ?? [],
                location_id: entity.locationId ?? null,
            })

        const { data, error } = supabaseData
        const userCreated = data?.[0]

        if (error) {
            return {
                isUpsert: false,
                message: supabaseData.error?.message,
            }
        }
        if (!userCreated || !userCreated.success) {
            return {
                isUpsert: false,
                message: userCreated?.message,
            }
        }
        return {
            isUpsert: true,
            message: userCreated.message,
        }
    }

    private async createSSOUser(
        entity: AddUserRequest,
        token: string,
    ): Promise<{ userId: string; email: string } | null> {
        //Fix issue to create user with sso domain
        const supabase = this.createAuthenticatedClient(token)
        const { data: user, error } = await supabase
            .schema('auth_layer')
            .rpc('create_user_sso', {
                user_first_name: entity.firstName,
                user_last_name: entity.lastName,
                user_email: entity.email,
                use_case_team_ids: entity.useCaseTeamIds ?? [],
                access_id: entity.accessId,
                sso_domain: entity.ssoDomain ?? null,
                location_id: entity.locationId ?? null,
            })

        if (error) {
            if (error.message.includes('User already exists')) {
                throw new ConflictException(
                    `An account with the email address ${entity.email} already exists.`,
                )
            }
            throwHttpException(error.message, error.code)
        }

        if (!user) {
            return null
        }
        return {
            userId: user[0].user_id,
            email: user[0].email,
        }
    }
}
