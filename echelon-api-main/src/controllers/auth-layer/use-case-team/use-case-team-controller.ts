import {
    Body,
    Controller,
    Delete,
    Get,
    HttpStatus,
    Inject,
    NotFoundException,
    Param,
    Post,
    Put,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common'
import { ApiBody, ApiResponse } from '@nestjs/swagger'
import { DataManagerController } from 'src/controllers/auth-layer/generic/data-manager-controller'
import { IAuthCustomRequest } from 'src/controllers/http-helpers'
import { HttpResponse, ok } from 'src/controllers/http-helpers/http-response'
import {
    AddUseCaseTeamRequest,
    FiltersSelectAllUseCaseTeamRequest,
    UpdateUseCaseTeamRequest,
} from 'src/domain/auth-layer/use-case-team/request'
import {
    AddUseCaseTeamResponse,
    FiltersSelectAllUseCaseTeamCountMemberResponse,
    FiltersSelectAllUseCaseTeamResponse,
    UpdateUseCaseTeamResponse,
} from 'src/domain/auth-layer/use-case-team/response'
import { FilterSelectUseCaseTeamResponse } from 'src/domain/auth-layer/use-case-team/response/filter-select-use-case-team-response'
import { IUseCaseTeamService } from 'src/domain/interfaces/services/auth-layer/use-case-team'
import { AuthGuard } from 'src/middleware/auth-guard'
import { MessageGeneratorApiResponse } from 'src/shared/domains/generics/message-generator-api-response'
import { throwHttpException } from 'src/utils'
@UseGuards(AuthGuard)
@Controller('use-case-teams')
export class UseCaseTeamController extends DataManagerController<
    AddUseCaseTeamRequest,
    AddUseCaseTeamResponse,
    UpdateUseCaseTeamRequest,
    UpdateUseCaseTeamResponse,
    FilterSelectUseCaseTeamResponse,
    FiltersSelectAllUseCaseTeamRequest,
    FiltersSelectAllUseCaseTeamResponse
> {
    constructor(
        @Inject('IUseCaseTeamService')
        private readonly useCaseTeamService: IUseCaseTeamService,
    ) {
        super('UseCaseTeam')
    }

    @Post()
    @ApiBody({
        description:
            MessageGeneratorApiResponse.bodyDescriptionCreatedMessage(
                'UseCaseTeam',
            ),
        type: AddUseCaseTeamRequest,
    })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: MessageGeneratorApiResponse.message(
            'UseCaseTeam',
            HttpStatus.CREATED,
        ),
        type: AddUseCaseTeamResponse,
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: MessageGeneratorApiResponse.message(
            'UseCaseTeam',
            HttpStatus.BAD_REQUEST,
        ),
        type: AddUseCaseTeamResponse,
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: MessageGeneratorApiResponse.message(
            'UseCaseTeam',
            HttpStatus.UNAUTHORIZED,
        ),
        type: AddUseCaseTeamResponse,
    })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: MessageGeneratorApiResponse.message(
            'UseCaseTeam',
            HttpStatus.INTERNAL_SERVER_ERROR,
        ),
        type: AddUseCaseTeamResponse,
    })
    async post(
        @Body() data: AddUseCaseTeamRequest,
        @Req() req: IAuthCustomRequest,
    ): Promise<HttpResponse<AddUseCaseTeamResponse>> {
        try {
            const result = await this.useCaseTeamService.add(
                data,
                req.authToken,
            )
            if (!result) {
                throwHttpException(
                    'UseCaseTeam not created',
                    HttpStatus.BAD_REQUEST,
                    HttpStatus.BAD_REQUEST,
                )
            }
            return ok(result)
        } catch (error) {
            console.log('[UseCaseTeamController POST ADD]: ', error)
            throwHttpException(
                'An unexpected error occurred. Please try again later.',
                'Internal Server Error',
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }

    @Put()
    async put(
        @Body() data: UpdateUseCaseTeamRequest,
    ): Promise<HttpResponse<UpdateUseCaseTeamResponse>> {
        try {
            const result = await this.useCaseTeamService.update(data, '')
            if (!result) {
                throwHttpException(
                    'UseCaseTeam not updated',
                    HttpStatus.BAD_REQUEST,
                    HttpStatus.BAD_REQUEST,
                )
            }
            return ok(result)
        } catch (error) {
            console.log('[UseCaseTeamController PUT UPDATE]: ', error)
            throwHttpException(
                'An unexpected error occurred. Please try again later.',
                'Internal Server Error',
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }

    @Get()
    async getAll(
        @Query() filters: FiltersSelectAllUseCaseTeamRequest,
    ): Promise<HttpResponse<FiltersSelectAllUseCaseTeamResponse[]>> {
        try {
            const result = await this.useCaseTeamService.selectAll(filters)
            if (!result) {
                throw new NotFoundException('UseCaseTeams not found.')
            }
            return ok(result)
        } catch (error) {
            console.log('[UseCaseTeamController GET getAll]: ', error)
            throwHttpException(
                'An unexpected error occurred. Please try again later.',
                'Internal Server Error',
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }

    @Get('members-count')
    async getAllUseCaseTeamCountMember(): Promise<
        HttpResponse<FiltersSelectAllUseCaseTeamCountMemberResponse[]>
    > {
        try {
            const result = await this.useCaseTeamService.selectAllCountMember()
            if (!result) {
                throw new NotFoundException('UseCaseTeams not found.')
            }
            return ok(result)
        } catch (error) {
            console.log('[UseCaseTeamController GET members-count]: ', error)
            throwHttpException(
                'An unexpected error occurred. Please try again later.',
                'Internal Server Error',
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }

    @Get(':id')
    async get(@Param('id') id: number | string): Promise<HttpResponse<any>> {
        try {
            const result = await this.useCaseTeamService.selectById(id)
            if (!result) {
                throw new NotFoundException('UseCaseTeam not found.')
            }
            return ok(result)
        } catch (error) {
            console.log('[UseCaseTeamController GET by id]: ', error)
            throwHttpException(
                'An unexpected error occurred. Please try again later.',
                'Internal Server Error',
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }

    @Delete(':id')
    async delete(
        @Param('id') id: number | string,
    ): Promise<HttpResponse<string>> {
        try {
            await this.useCaseTeamService.delete(id, '')
            return ok(`UseCaseTeam ${id} deleted.`)
        } catch (error) {
            console.log('[UseCaseTeamController DELETE]: ', error)
            throwHttpException(
                'An unexpected error occurred. Please try again later.',
                'Internal Server Error',
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }

    @Get('check-team-member/:id')
    async verifyUserTeamRelation(
        @Param('id') id: number | string,
        @Req() req: IAuthCustomRequest,
    ): Promise<HttpResponse<boolean>> {
        try {
            const result = await this.useCaseTeamService.verifyUserTeamMember({
                useCaseTeamId: id,
                userId: req.user.user_id,
            })
            if (!result) {
                throw new NotFoundException(
                    'User is not a member of this team.',
                )
            }
            return ok(result)
        } catch (error) {
            console.log(
                '[UseCaseTeamController GET check-team-member/:id]: ',
                error,
            )
            throwHttpException(
                'An unexpected error occurred. Please try again later.',
                'Internal Server Error',
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }
}
