import {
    AddUseCaseTeamRequest,
    FilterSelectUseCaseTeamRequest,
    FiltersSelectAllUseCaseTeamRequest,
    UpdateUseCaseTeamRequest,
} from 'src/domain/auth-layer/use-case-team/request'
import {
    AddUseCaseTeamResponse,
    FiltersSelectAllUseCaseTeamResponse,
    UpdateUseCaseTeamResponse,
} from 'src/domain/auth-layer/use-case-team/response'
import { IDataManagerService } from 'src/domain/interfaces/generic/i-base-data-manager'

export interface IDepatmentRepository
    extends IDataManagerService<
        AddUseCaseTeamRequest,
        AddUseCaseTeamResponse,
        UpdateUseCaseTeamRequest,
        UpdateUseCaseTeamResponse,
        FilterSelectUseCaseTeamRequest,
        FiltersSelectAllUseCaseTeamRequest,
        FiltersSelectAllUseCaseTeamResponse
    > {}
