import { Inject, Injectable } from '@nestjs/common'
import {
    UseCaseTeamModelDB,
    UseCaseTeamModel,
} from 'src/domain/auth-layer/use-case-team/model'
import {
    AddUseCaseTeamRequest,
    FilterSelectUseCaseTeamRequest,
    FiltersSelectAllUseCaseTeamRequest,
    UpdateUseCaseTeamRequest,
    VerifyUseCaseTeamMemberRequest,
} from 'src/domain/auth-layer/use-case-team/request'
import {
    AddUseCaseTeamResponse,
    FilterSelectUseCaseTeamResponse,
    FiltersSelectAllUseCaseTeamCountMemberResponse,
    FiltersSelectAllUseCaseTeamResponse,
    UpdateUseCaseTeamResponse,
} from 'src/domain/auth-layer/use-case-team/response'
import { IUseCaseTeamRepository } from 'src/domain/interfaces/repository/auth-layer/use-case-team/i-use-case-team-repository'
import { IUseCaseTeamService } from 'src/domain/interfaces/services/auth-layer/use-case-team'
import { arrayToCamel } from 'src/utils/caseConverter'

@Injectable()
export class UseCaseTeamService implements IUseCaseTeamService {
    constructor(
        @Inject('IUseCaseTeamRepository')
        private readonly useCaseTeamRepo: IUseCaseTeamRepository,
    ) {}

    async selectById(id: string | number): Promise<any[] | null> {
        const result = await this.useCaseTeamRepo.selectById(id)
        if (!result) {
            return null
        }
        return arrayToCamel(result)
    }

    async verifyUserTeamMember(
        params: VerifyUseCaseTeamMemberRequest,
    ): Promise<boolean> {
        return this.useCaseTeamRepo.verifyUseCaseTeamMember(params)
    }

    async add(
        entity: AddUseCaseTeamRequest,
    ): Promise<AddUseCaseTeamResponse | null> {
        const useCaseTeamData =
            UseCaseTeamModelDB.fromAddUseCaseTeamRequest(entity)
        const result = await this.useCaseTeamRepo.add(
            useCaseTeamData,
            'use_case_team',
        )
        return UseCaseTeamModel.fromAddUseCaseTeamResponse(result)
    }
    async update(
        entity: UpdateUseCaseTeamRequest,
    ): Promise<UpdateUseCaseTeamResponse | null> {
        const useCaseTeamData =
            UseCaseTeamModelDB.fromUpdateUseCaseTeamRequest(entity)
        const result = await this.useCaseTeamRepo.update(
            useCaseTeamData,
            'use_case_team',
        )
        return UseCaseTeamModel.fromUpdateUseCaseTeamResponse(result)
    }

    async delete(id: number | string): Promise<string | null> {
        await this.useCaseTeamRepo.delete(id, 'use_case_team')
        return null
    }

    async select({
        id,
    }: FilterSelectUseCaseTeamRequest): Promise<FilterSelectUseCaseTeamResponse | null> {
        const result = await this.useCaseTeamRepo.select(id, 'use_case_team')
        if (!result) {
            return null
        }
        return UseCaseTeamModel.fromSelectUseCaseTeamResponse(result)
    }

    async selectAll(
        entity: FiltersSelectAllUseCaseTeamRequest,
    ): Promise<FiltersSelectAllUseCaseTeamResponse[] | null> {
        const result = await this.useCaseTeamRepo.selectAll(
            entity,
            'use_case_team',
        )
        if (!result) {
            return null
        }
        return UseCaseTeamModel.fromSelectALLUseCaseTeamResponse(result)
    }

    async selectAllCountMember(): Promise<
        FiltersSelectAllUseCaseTeamCountMemberResponse[] | null
    > {
        const result = await this.useCaseTeamRepo.selectAllCountMember()
        if (!result) {
            return null
        }
        return arrayToCamel(result)
    }
}
