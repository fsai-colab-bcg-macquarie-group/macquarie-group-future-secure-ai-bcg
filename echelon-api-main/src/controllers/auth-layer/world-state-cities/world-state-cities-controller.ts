import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Inject,
    NotFoundException,
    Param,
    Post,
    Put,
    Req,
    UseGuards,
} from '@nestjs/common'
import { IAuthCustomRequest } from 'src/controllers/http-helpers'
import { HttpResponse, ok } from 'src/controllers/http-helpers/http-response'
import {
    AddWorldStateCitiesRequest,
    FilterSelectWorldStateCitiesRequest,
    FiltersSelectAllWorldStateCitiesRequest,
    UpdateWorldStateCitiesRequest,
} from 'src/domain/auth-layer/world-state-cities/request'
import {
    AddWorldStateCitiesResponse,
    FilterSelectWorldStateCitiesResponse,
    FiltersSelectAllWorldStateCitiesResponse,
    UpdateWorldStateCitiesResponse,
} from 'src/domain/auth-layer/world-state-cities/response'
import { DataManagerController } from '../generic/data-manager-controller'
import { IWorldStateCitiesService } from 'src/domain/interfaces/services/auth-layer/world-state-cities'
import { throwHttpException } from 'src/utils'
import { AuthGuard } from 'src/middleware/auth-guard'
import { LoggerService } from 'src/logger/logger.service'

@UseGuards(AuthGuard)
@Controller('locations')
export class WorldStateCitiesController extends DataManagerController<
    AddWorldStateCitiesRequest,
    AddWorldStateCitiesResponse,
    UpdateWorldStateCitiesRequest,
    UpdateWorldStateCitiesResponse,
    FilterSelectWorldStateCitiesResponse,
    FilterSelectWorldStateCitiesRequest,
    FiltersSelectAllWorldStateCitiesResponse
> {
    constructor(
        @Inject('IWorldStateCitiesService')
        private readonly worldStateCitiesService: IWorldStateCitiesService,
        private readonly logger: LoggerService,
    ) {
        super('WorldStateCities')
    }

    @Post()
    async post(
        @Body() data: AddWorldStateCitiesRequest,
        @Req() req: IAuthCustomRequest,
    ): Promise<HttpResponse<AddWorldStateCitiesResponse>> {
        try {
            this.logger.log('Route:[post], Message: [Creating new location]')
            const locationDataCreated = await this.worldStateCitiesService.add(
                data,
                req.authToken,
            )
            if (!locationDataCreated) {
                throwHttpException(
                    'Location not created',
                    HttpStatus.BAD_REQUEST,
                    HttpStatus.BAD_REQUEST,
                )
            }
            return ok(locationDataCreated)
        } catch (error) {
            this.logger.error(`[WorldStateCitiesController POST]: ${error}`)
            throwHttpException(
                'An unexpected error occurred. Please try again later.',
                'Internal Server Error',
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async get(
        @Param('id') id: number | string,
    ): Promise<HttpResponse<FilterSelectWorldStateCitiesResponse>> {
        try {
            this.logger.log('Route:[get], Message: [Getting location by ID]')
            const locationData = await this.worldStateCitiesService.select({
                id,
            })
            if (!locationData) {
                throw new NotFoundException('Location not found')
            }
            return ok(locationData)
        } catch (error) {
            this.logger.error(`[WorldStateCitiesController GET]: ${error}`)
            throwHttpException(
                'An unexpected error occurred. Please try again later.',
                'Internal Server Error',
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    async getAll(
        entity: FiltersSelectAllWorldStateCitiesRequest,
    ): Promise<
        HttpResponse<FiltersSelectAllWorldStateCitiesResponse[] | null>
    > {
        try {
            this.logger.log('Route:[getAll], Message: [Getting all locations]')
            const result = await this.worldStateCitiesService.selectAll(entity)
            return ok(result)
        } catch (error) {
            this.logger.error(`[WorldStateCitiesController GET ALL]: ${error}`)
            throwHttpException(
                'An unexpected error occurred. Please try again later.',
                'Internal Server Error',
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }

    @Put()
    @HttpCode(HttpStatus.OK)
    async put(
        @Body() data: UpdateWorldStateCitiesRequest,
    ): Promise<HttpResponse<UpdateWorldStateCitiesResponse>> {
        try {
            this.logger.log('Route:[put], Message: [Updating location]')
            const locationDataUpdated =
                await this.worldStateCitiesService.update(data, '')
            if (!locationDataUpdated) {
                throwHttpException(
                    'Location not updated',
                    HttpStatus.BAD_REQUEST,
                    HttpStatus.BAD_REQUEST,
                )
            }
            return ok(locationDataUpdated)
        } catch (error) {
            this.logger.error(`[WorldStateCitiesController PUT]: ${error}`)
            throwHttpException(
                'An unexpected error occurred. Please try again later.',
                'Internal Server Error',
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }

    @HttpCode(HttpStatus.OK)
    @Get('search/:term')
    async search(
        @Param('term') term: string,
    ): Promise<HttpResponse<FiltersSelectAllWorldStateCitiesResponse[]>> {
        try {
            this.logger.log('Route:[search], Message: [Searching locations]')
            const result = await this.worldStateCitiesService.search({
                term,
            })
            if (!result) {
                throw new NotFoundException('Location not found')
            }
            return ok(result)
        } catch (error) {
            this.logger.error(`[WorldStateCitiesController SEARCH]: ${error}`)
            throwHttpException(
                'An unexpected error occurred. Please try again later.',
                'Internal Server Error',
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async delete(
        @Param('id') id: number | string,
    ): Promise<HttpResponse<string>> {
        try {
            this.logger.log('Route:[delete], Message: [Deleting location]')
            await this.worldStateCitiesService.delete(id, '')
            return ok('WorldStateCities deleted')
        } catch (error) {
            this.logger.error(`[WorldStateCitiesController DELETE]: ${error}`)
            throwHttpException(
                'An unexpected error occurred. Please try again later.',
                'Internal Server Error',
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }
}
