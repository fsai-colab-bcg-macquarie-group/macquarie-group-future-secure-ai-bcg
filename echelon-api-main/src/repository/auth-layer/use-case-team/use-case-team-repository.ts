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
import { IUseCaseTeamRepository } from 'src/domain/interfaces/repository/auth-layer/use-case-team/i-use-case-team-repository'
import { BaseDataManager } from 'src/repository/base/base-data-manager'
import { throwHttpException } from 'src/utils'

export class UseCaseTeamRepository
    extends BaseDataManager<
        UseCaseTeamModelDB,
        AddUseCaseTeamResponse,
        UseCaseTeamModelDB,
        UpdateUseCaseTeamResponse,
        FilterSelectUseCaseTeamResponse,
        FiltersSelectAllUseCaseTeamRequest,
        FiltersSelectAllUseCaseTeamResponse
    >
    implements IUseCaseTeamRepository
{
    async verifyUseCaseTeamMember(
        params: VerifyUseCaseTeamMemberRequest,
    ): Promise<boolean> {
        const supabase = this.createAuthenticatedClient(this.token)
        const { data, error } = await supabase
            .schema('auth_layer')
            .from('use_case_team_member')
            .select('id')
            .eq('use_case_team_id', params.useCaseTeamId)
            .eq('user_id', params.userId)
        if (error) {
            throwHttpException(error.message, error.code)
        }
        if (data.length > 0) {
            return true
        }
        return false
    }

    async selectById(id: string | number): Promise<any[] | null> {
        const supabase = this.createAuthenticatedClient(this.token)
        const { data, error } = await supabase
            .schema('auth_layer')
            .rpc('get_use_case_team_details', {
                param_use_case_team_id: id,
            })
        if (error) {
            throwHttpException(error.message, error.code)
        }
        if (!data || data.length === 0) {
            return null
        }
        return data
    }

    async selectAllCountMember(): Promise<
        FiltersSelectAllUseCaseTeamCountMemberResponse[] | null
    > {
        const supabase = this.createAuthenticatedClient(this.token)
        const { data, error } = await supabase
            .schema('auth_layer')
            .rpc('get_use_case_teams_member_count')
        if (error) {
            throwHttpException(error.message, error.code)
        }
        return data
    }

    async selectAll(
        entity: FiltersSelectAllUseCaseTeamRequest,
        database: string,
    ): Promise<FiltersSelectAllUseCaseTeamResponse[]> {
        this.logger.log(
            `Select all entity with filters: ${JSON.stringify(entity)}`,
        )
        const supabase = this.createAuthenticatedClient(this.token)

        const [orderColumn, orderDirection] =
            entity.orderBy === 'createdAt'
                ? ['created_at', { ascending: false }]
                : ['name', { ascending: true }]

        const { data, error } = await supabase
            .schema('auth_layer')
            .from(database)
            .select()
            .order(orderColumn, orderDirection)

        if (error) {
            throwHttpException(error.message, error.code)
        }
        return data
    }
}
