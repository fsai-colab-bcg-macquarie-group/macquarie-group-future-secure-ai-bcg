import {
    AddUseCaseTeamRequest,
    FiltersSelectAllUseCaseTeamRequest,
    UpdateUseCaseTeamRequest,
    VerifyUseCaseTeamMemberRequest,
} from 'src/domain/auth-layer/use-case-team/request'
import {
    AddUseCaseTeamResponse,
    FiltersSelectAllUseCaseTeamCountMemberResponse,
    FiltersSelectAllUseCaseTeamResponse,
    UpdateUseCaseTeamResponse,
} from 'src/domain/auth-layer/use-case-team/response'
import { FilterSelectUseCaseTeamResponse } from 'src/domain/auth-layer/use-case-team/response/filter-select-use-case-team-response'
import { IPersistenceBase } from 'src/services/interfaces/generic/i-persistence-base'

export interface IUseCaseTeamService
    extends IPersistenceBase<
        AddUseCaseTeamRequest,
        AddUseCaseTeamResponse,
        UpdateUseCaseTeamRequest,
        UpdateUseCaseTeamResponse,
        any,
        FilterSelectUseCaseTeamResponse,
        FiltersSelectAllUseCaseTeamRequest,
        FiltersSelectAllUseCaseTeamResponse
    > {
    verifyUserTeamMember: (
        params: VerifyUseCaseTeamMemberRequest,
    ) => Promise<boolean>
    selectAllCountMember: () => Promise<
        FiltersSelectAllUseCaseTeamCountMemberResponse[] | null
    >
    selectById: (id: string | number) => Promise<any[] | null>
}
