import { UseCaseTeamModelDB } from 'src/domain/auth-layer/use-case-team/model'
import {
    FiltersSelectAllUseCaseTeamRequest,
    VerifyUseCaseTeamMemberRequest,
} from 'src/domain/auth-layer/use-case-team/request'
import {
    AddUseCaseTeamResponse,
    FiltersSelectAllUseCaseTeamCountMemberResponse,
    FiltersSelectAllUseCaseTeamResponse,
    UpdateUseCaseTeamResponse,
} from 'src/domain/auth-layer/use-case-team/response'
import { FilterSelectUseCaseTeamResponse } from 'src/domain/auth-layer/use-case-team/response/filter-select-use-case-team-response'
import { IDataManagerService } from 'src/domain/interfaces/generic/i-base-data-manager'

export interface IUseCaseTeamRepository
    extends IDataManagerService<
        UseCaseTeamModelDB,
        AddUseCaseTeamResponse,
        UseCaseTeamModelDB,
        UpdateUseCaseTeamResponse,
        FilterSelectUseCaseTeamResponse,
        FiltersSelectAllUseCaseTeamRequest,
        FiltersSelectAllUseCaseTeamResponse
    > {
    verifyUseCaseTeamMember: (
        params: VerifyUseCaseTeamMemberRequest,
    ) => Promise<boolean>

    selectAllCountMember: () => Promise<
        FiltersSelectAllUseCaseTeamCountMemberResponse[] | null
    >
    selectById: (id: string | number) => Promise<any[] | null>
}
