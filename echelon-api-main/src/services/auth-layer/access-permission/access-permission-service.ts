import { Inject, Injectable } from '@nestjs/common'
import { AccessHierarchyPermissionModel } from 'src/domain/auth-layer/access-permission/model/access-permission-model'
import {
    AddAccessHierarchyPermissionRequest,
    FiltersSelectAllAccessHierarchyPermissionRequest,
    UptadeAccessHierarchyPermissionRequest,
} from 'src/domain/auth-layer/access-permission/request'
import {
    AddAccessHierarchyPermissionResponse,
    FilterSelectAccessHierarchyPermissionResponse,
    FiltersSelectAccessHierarchyPermissionResponse,
    UptadeAccessHierarchyPermissionResponse,
} from 'src/domain/auth-layer/access-permission/response'
import { IAccessHierarchyPermissionRepository } from 'src/domain/interfaces/repository/auth-layer/access-permission/i-access-permission-repository'
import { IAccessHierarchyPermissionService } from 'src/domain/interfaces/services/auth-layer/access-permission/i-access-permission-service'

@Injectable()
export class AccessHierarchyPermissionService
    implements IAccessHierarchyPermissionService
{
    constructor(
        @Inject('IAccessHierarchyPermissionRepository')
        private readonly accessHierarchyPermissionRepo: IAccessHierarchyPermissionRepository,
    ) {}

    async add(
        entity: AddAccessHierarchyPermissionRequest,
    ): Promise<AddAccessHierarchyPermissionResponse | null> {
        const accessHierarchyPermissionModel =
            AccessHierarchyPermissionModel.fromAddAccessHierarchyPermissionRequest(
                entity,
            )
        const result = await this.accessHierarchyPermissionRepo.add(
            accessHierarchyPermissionModel,
            'access_permissions',
        )
        return result
    }
    async update(
        entity: UptadeAccessHierarchyPermissionRequest,
    ): Promise<UptadeAccessHierarchyPermissionResponse | null> {
        const accessHierarchyPermissionModel =
            AccessHierarchyPermissionModel.fromUpdateAccessHierarchyPermissionRequest(
                entity,
            )
        const result = await this.accessHierarchyPermissionRepo.update(
            accessHierarchyPermissionModel,
            'access_permissions',
        )
        return result
    }
    async delete(id: number | string): Promise<string | null> {
        const accessHierarchyPermissionModel =
            AccessHierarchyPermissionModel.fromDeleteAccessHierarchyPermissionRequest(
                id,
            )
        await this.accessHierarchyPermissionRepo.delete(
            accessHierarchyPermissionModel.id,
            'access_permissions',
        )
        return null
    }
    async select(
        id: number | string,
    ): Promise<FilterSelectAccessHierarchyPermissionResponse | null> {
        const accessHierarchyPermissionModel =
            AccessHierarchyPermissionModel.fromSelectAccessHierarchyRequest(id)
        const result = await this.accessHierarchyPermissionRepo.select(
            accessHierarchyPermissionModel.id,
            'access_permissions',
        )
        return result
    }
    async selectAll(
        entity: FiltersSelectAllAccessHierarchyPermissionRequest,
    ): Promise<FiltersSelectAccessHierarchyPermissionResponse[] | null> {
        const result = await this.accessHierarchyPermissionRepo.selectAll(
            entity,
            'access_permissions',
        )
        return result
    }

    async selectPermissionByAccessHierarchyId(
        accessId: number | string,
    ): Promise<FiltersSelectAccessHierarchyPermissionResponse[] | null> {
        const result =
            await this.accessHierarchyPermissionRepo.selectPermissionByAccessHierarchyId(
                accessId,
            )
        if (!result) return null
        return result
    }
}
