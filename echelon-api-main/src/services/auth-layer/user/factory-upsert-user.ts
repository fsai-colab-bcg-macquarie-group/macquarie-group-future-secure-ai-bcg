import { HttpStatus, Inject } from '@nestjs/common'
import {
    AddUserRequest,
    UpdateUserRequest,
} from 'src/domain/auth-layer/user/request'
import { IAccessHierarchyService } from 'src/domain/interfaces/services/auth-layer/access'
import { throwHttpException } from 'src/utils'

export class UpsertUserFactory {
    constructor(
        @Inject('IAccessHierarchyService')
        private readonly accessService: IAccessHierarchyService,
    ) {}

    async isAdminAccessId(accessId: string | number) {
        const adminAccessIds = await this.accessService.selectAdminAccessIds()
        return adminAccessIds.includes(accessId.toString())
    }

    async createUser({
        firstName,
        lastName,
        email,
        accessId,
        locationId,
        password,
        useCaseTeamIds = [],
        isSSO,
        ssoDomain,
    }: AddUserRequest) {
        const isAdmin = await this.isAdminAccessId(accessId)

        if (!isAdmin && (!useCaseTeamIds || useCaseTeamIds.length === 0)) {
            throwHttpException(
                'Users must have at least one useCaseTeamId.',
                HttpStatus.BAD_REQUEST,
                HttpStatus.BAD_REQUEST,
            )
        }

        const user = {
            firstName,
            lastName,
            email,
            accessId,
            locationId,
            password,
            isSSO,
            ssoDomain,
        }

        if (!isAdmin) {
            ;(user as any).useCaseTeamIds = useCaseTeamIds
        }

        return user
    }

    async updateUser({
        id,
        firstName,
        lastName,
        email,
        accessId,
        locationId,
        useCaseTeamIds = [],
        deletedAt,
        bannedUntil,
    }: UpdateUserRequest) {
        const isAdmin = await this.isAdminAccessId(accessId)

        if (!isAdmin && (!useCaseTeamIds || useCaseTeamIds.length === 0)) {
            throwHttpException(
                'Users must have at least one useCaseTeamId.',
                HttpStatus.BAD_REQUEST,
                HttpStatus.BAD_REQUEST,
            )
        }

        const user = {
            id,
            firstName,
            lastName,
            email,
            accessId,
            locationId,
            deletedAt,
            bannedUntil,
        }

        if (!isAdmin) {
            ;(user as any).useCaseTeamIds = useCaseTeamIds
        }

        return user
    }
}
