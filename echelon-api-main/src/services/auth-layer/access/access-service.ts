import { Inject, Injectable } from '@nestjs/common'
import { FiltersSelectAccessHierarchyPermissionResponse } from 'src/domain/auth-layer/access-permission/response'
import { AccessModel } from 'src/domain/auth-layer/access/model/access-model'
import { AccessHierarchyModelDB } from 'src/domain/auth-layer/access/model/access-model-db'
import {
    AddAccessHierarchyRequest,
    FiltersSelectAllAccessHierarchyRequest,
    UpdateAccessHierarchyRequest,
} from 'src/domain/auth-layer/access/request'
import {
    AddAccessHierarchyResponse,
    FilterSelectAccessHierarchyResponse,
    FiltersSelectAllAccessHierarchyResponse,
    UpdateAccessHierarchyResponse,
} from 'src/domain/auth-layer/access/response'
import { IAccessHierarchyRepository } from 'src/domain/interfaces/repository/auth-layer/access/i-access-repository'
import { IAccessHierarchyService } from 'src/domain/interfaces/services/auth-layer/access'
import { IAccessHierarchyPermissionService } from 'src/domain/interfaces/services/auth-layer/access-permission/i-access-permission-service'

@Injectable()
export class AccessHierarchyService implements IAccessHierarchyService {
    constructor(
        @Inject('IAccessHierarchyRepository')
        private readonly accessRepo: IAccessHierarchyRepository,
        @Inject('IAccessHierarchyPermissionService')
        private readonly accessHierarchyPermissionService: IAccessHierarchyPermissionService,
    ) {}

    async selectAdminAccessIds(): Promise<string[]> {
        return this.accessRepo.selectAdminAccessIds()
    }

    // async selectAvailableAccessHierarchyById(
    //     accessId: number | string,
    // ): Promise<FilterSelectAccessHierarchyResponse[] | null> {
    //     const result =
    //         await this.accessRepo.selectAvailableAccessHierarchy(accessId)
    //     if (!result) {
    //         return null
    //     }
    //     return AccessModel.fromSelectALLAccessResponse(result)
    // }

    async add(
        addAccessHierarchyService: AddAccessHierarchyRequest,
    ): Promise<AddAccessHierarchyResponse | null> {
        const accessModel =
            AccessHierarchyModelDB.fromAddAccessHierarchyRequest(
                addAccessHierarchyService,
            )
        const result = await this.accessRepo.add(accessModel, 'access')
        return result
    }

    async select(
        id: number | string,
    ): Promise<FilterSelectAccessHierarchyResponse | null> {
        const accessModel =
            AccessHierarchyModelDB.fromSelectAccessHierarchyRequest(id)
        const result = await this.accessRepo.select(accessModel.id, 'access')
        if (!result) {
            return null
        }
        return AccessModel.fromSelectAccessResponse(result)
    }

    async update(
        updateAccessHierarchyService: UpdateAccessHierarchyRequest,
    ): Promise<UpdateAccessHierarchyResponse | null> {
        const accessModel =
            AccessHierarchyModelDB.fromUpdateAccessHierarchyRequest(
                updateAccessHierarchyService,
            )
        const result = await this.accessRepo.update(accessModel, 'access')
        return result
    }

    async delete(id: number): Promise<string | null> {
        const accessModel =
            AccessHierarchyModelDB.fromDeleteAccessHierarchyRequest(id)
        await this.accessRepo.delete(accessModel.id, 'access')
        return null
    }

    async selectAll(
        entity: FiltersSelectAllAccessHierarchyRequest,
    ): Promise<FiltersSelectAllAccessHierarchyResponse[] | null> {
        const result = await this.accessRepo.selectAll(entity, 'access')
        return AccessModel.fromSelectALLAccessResponse(result)
    }

    async selectPermissionByAccessHierarchyId(
        accessId: number | string,
    ): Promise<FiltersSelectAccessHierarchyPermissionResponse[] | null> {
        const result =
            await this.accessHierarchyPermissionService.selectPermissionByAccessHierarchyId(
                accessId,
            )
        return result
    }
}
