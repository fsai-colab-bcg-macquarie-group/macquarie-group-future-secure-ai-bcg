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
    Query,
    Req,
    UseGuards,
} from '@nestjs/common'
import { ApiBody, ApiParam, ApiResponse } from '@nestjs/swagger'
import { IAuthCustomRequest } from 'src/controllers/http-helpers'
import { HttpResponse, ok } from 'src/controllers/http-helpers/http-response'
import { FiltersSelectAccessHierarchyPermissionResponse } from 'src/domain/auth-layer/access-permission/response'
import {
    AddAccessHierarchyRequest,
    FilterSelectAccessHierarchyRequest,
    FiltersSelectAllAccessHierarchyRequest,
    UpdateAccessHierarchyRequest,
} from 'src/domain/auth-layer/access/request'
import {
    AddAccessHierarchyResponse,
    FilterSelectAccessHierarchyResponse,
    FiltersSelectAllAccessHierarchyResponse,
    UpdateAccessHierarchyResponse,
} from 'src/domain/auth-layer/access/response'
import { IAccessHierarchyService } from 'src/domain/interfaces/services/auth-layer/access'
import { AuthGuard } from 'src/middleware/auth-guard'
import { MessageGeneratorApiResponse } from 'src/shared/domains/generics/message-generator-api-response'
import { DataManagerController } from '../generic/data-manager-controller'
import { throwHttpException } from 'src/utils'
import { LoggerService } from 'src/logger/logger.service'

@UseGuards(AuthGuard)
@Controller('access')
export class AccessHierarchyController extends DataManagerController<
    AddAccessHierarchyRequest,
    AddAccessHierarchyResponse,
    UpdateAccessHierarchyRequest,
    UpdateAccessHierarchyResponse,
    FilterSelectAccessHierarchyResponse,
    FilterSelectAccessHierarchyRequest,
    FiltersSelectAllAccessHierarchyResponse
> {
    constructor(
        @Inject('IAccessHierarchyService')
        private readonly accessHierarchyService: IAccessHierarchyService,
        private readonly logger: LoggerService,
    ) {
        super('AccessHierarchy')
    }

    @ApiBody({
        description:
            MessageGeneratorApiResponse.bodyDescriptionCreatedMessage(
                'AccessHierarchy',
            ),
        type: AddAccessHierarchyRequest,
    })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: MessageGeneratorApiResponse.message(
            'AccessHierarchy',
            HttpStatus.CREATED,
        ),
        type: AddAccessHierarchyResponse,
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: MessageGeneratorApiResponse.message(
            'AccessHierarchy',
            HttpStatus.BAD_REQUEST,
        ),
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: MessageGeneratorApiResponse.message(
            'AccessHierarchy',
            HttpStatus.UNAUTHORIZED,
        ),
    })
    @ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: MessageGeneratorApiResponse.message(
            'AccessHierarchy',
            HttpStatus.FORBIDDEN,
        ),
    })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: MessageGeneratorApiResponse.message(
            'AccessHierarchy',
            HttpStatus.INTERNAL_SERVER_ERROR,
        ),
    })
    @Post()
    async post(
        @Body() data: AddAccessHierarchyRequest,
        @Req() req: IAuthCustomRequest,
    ): Promise<HttpResponse<AddAccessHierarchyResponse>> {
        try {
            this.logger.log(
                'Route:[post], Message: [Creating new access hierarchy]',
            )
            const accessCreated = await this.accessHierarchyService.add(
                data,
                req.authToken,
            )
            if (!accessCreated) {
                throwHttpException(
                    'AccessHierarchy not created',
                    HttpStatus.BAD_REQUEST,
                    HttpStatus.BAD_REQUEST,
                )
            }
            return ok(accessCreated)
        } catch (error) {
            this.logger.error(`[AccessHierarchyController POST]: ${error}`)
            throwHttpException(
                'An unexpected error occurred. Please try again later.',
                'Internal Server Error',
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }

    @ApiParam({
        name: 'id',
        description: 'The unique identifier of the access',
        required: true,
        example: 123,
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: MessageGeneratorApiResponse.message(
            'AccessHierarchy',
            HttpStatus.OK,
        ),
        type: FilterSelectAccessHierarchyResponse,
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: MessageGeneratorApiResponse.message(
            'AccessHierarchy',
            HttpStatus.BAD_REQUEST,
        ),
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: MessageGeneratorApiResponse.message(
            'AccessHierarchy',
            HttpStatus.NOT_FOUND,
        ),
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: MessageGeneratorApiResponse.message(
            'AccessHierarchy',
            HttpStatus.UNAUTHORIZED,
        ),
    })
    @ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: MessageGeneratorApiResponse.message(
            'AccessHierarchy',
            HttpStatus.FORBIDDEN,
        ),
    })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: MessageGeneratorApiResponse.message(
            'AccessHierarchy',
            HttpStatus.INTERNAL_SERVER_ERROR,
        ),
    })
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async get(
        @Param('id') id: string,
        @Req() _req: IAuthCustomRequest,
    ): Promise<HttpResponse<FilterSelectAccessHierarchyResponse>> {
        try {
            this.logger.log(
                'Route:[get], Message: [Getting access hierarchy by ID]',
            )
            const result = await this.accessHierarchyService.select(id)
            if (!result) {
                throw new NotFoundException('Access not found')
            }
            return ok(result)
        } catch (error) {
            this.logger.error(`[AccessHierarchyController GET]: ${error}`)
            throwHttpException(
                'An unexpected error occurred. Please try again later.',
                'Internal Server Error',
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }

    @ApiBody({
        description:
            MessageGeneratorApiResponse.bodyDescriptionCreatedMessage(
                'AccessHierarchy',
            ),
        type: FiltersSelectAllAccessHierarchyRequest,
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: MessageGeneratorApiResponse.message(
            'AccessHierarchy',
            HttpStatus.OK,
        ),
        type: [FiltersSelectAllAccessHierarchyResponse],
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: MessageGeneratorApiResponse.message(
            'AccessHierarchy',
            HttpStatus.NOT_FOUND,
        ),
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: MessageGeneratorApiResponse.message(
            'AccessHierarchy',
            HttpStatus.BAD_REQUEST,
        ),
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: MessageGeneratorApiResponse.message(
            'AccessHierarchy',
            HttpStatus.UNAUTHORIZED,
        ),
    })
    @ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: MessageGeneratorApiResponse.message(
            'AccessHierarchy',
            HttpStatus.FORBIDDEN,
        ),
    })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: MessageGeneratorApiResponse.message(
            'AccessHierarchy',
            HttpStatus.INTERNAL_SERVER_ERROR,
        ),
    })
    @Get()
    @HttpCode(HttpStatus.OK)
    async getAll(
        @Query() filters: FiltersSelectAllAccessHierarchyRequest,
    ): Promise<HttpResponse<FiltersSelectAllAccessHierarchyResponse[] | null>> {
        try {
            this.logger.log(
                'Route:[getAll], Message: [Getting all access hierarchies]',
            )
            const result = await this.accessHierarchyService.selectAll(filters)
            if (!result) {
                throw new NotFoundException('Access not found')
            }
            return ok(result)
        } catch (error) {
            this.logger.error(`[AccessHierarchyController GET ALL]: ${error}`)
            throwHttpException(
                'An unexpected error occurred. Please try again later.',
                'Internal Server Error',
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }

    @ApiBody({
        description:
            MessageGeneratorApiResponse.bodyDescriptionUpdatedMessage(
                'AccessHierarchy',
            ),
        type: UpdateAccessHierarchyRequest,
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: MessageGeneratorApiResponse.message(
            'AccessHierarchy',
            HttpStatus.OK,
        ),
        type: UpdateAccessHierarchyResponse,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: MessageGeneratorApiResponse.message(
            'AccessHierarchy',
            HttpStatus.NOT_FOUND,
        ),
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: MessageGeneratorApiResponse.message(
            'AccessHierarchy',
            HttpStatus.BAD_REQUEST,
        ),
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: MessageGeneratorApiResponse.message(
            'AccessHierarchy',
            HttpStatus.UNAUTHORIZED,
        ),
    })
    @ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: MessageGeneratorApiResponse.message(
            'AccessHierarchy',
            HttpStatus.FORBIDDEN,
        ),
    })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: MessageGeneratorApiResponse.message(
            'AccessHierarchy',
            HttpStatus.INTERNAL_SERVER_ERROR,
        ),
    })
    @Put()
    @HttpCode(HttpStatus.OK)
    async put(
        @Body() data: UpdateAccessHierarchyRequest,
        @Req() req: IAuthCustomRequest,
    ): Promise<HttpResponse<UpdateAccessHierarchyResponse>> {
        try {
            this.logger.log('Route:[put], Message: [Updating access hierarchy]')
            const result = await this.accessHierarchyService.update(
                data,
                req.authToken,
            )
            if (!result) {
                throw new NotFoundException('Access not found')
            }
            return ok(result)
        } catch (error) {
            this.logger.error(`[AccessHierarchyController PUT]: ${error}`)
            throwHttpException(
                'An unexpected error occurred. Please try again later.',
                'Internal Server Error',
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }

    @ApiParam({
        name: 'id',
        description: 'The unique identifier of the access',
        required: true,
        example: 123,
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: MessageGeneratorApiResponse.message(
            'AccessHierarchy',
            HttpStatus.OK,
        ),
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: MessageGeneratorApiResponse.message(
            'AccessHierarchy',
            HttpStatus.NOT_FOUND,
        ),
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: MessageGeneratorApiResponse.message(
            'AccessHierarchy',
            HttpStatus.BAD_REQUEST,
        ),
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: MessageGeneratorApiResponse.message(
            'AccessHierarchy',
            HttpStatus.UNAUTHORIZED,
        ),
    })
    @ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: MessageGeneratorApiResponse.message(
            'AccessHierarchy',
            HttpStatus.FORBIDDEN,
        ),
    })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: MessageGeneratorApiResponse.message(
            'AccessHierarchy',
            HttpStatus.INTERNAL_SERVER_ERROR,
        ),
    })
    // @Get('available-access-hierarchy')
    // @HttpCode(HttpStatus.OK)
    // async getAvailableAccessHierarchy(
    //     @Req() req: IAuthCustomRequest,
    // ): Promise<HttpResponse<FilterSelectAccessHierarchyResponse[]>> {
    //     try {
    //         const result =
    //             await this.accessHierarchyService.selectAvailableAccessHierarchyById(
    //                 req.user.profile.access_id,
    //             )
    //         if (!result) {
    //             throw new NotFoundException(
    //                 'Not AccessHierarchy Available for this user',
    //             )
    //         }
    //         return ok(result)
    //     } catch (error) {
    //         console.log('[AccessHierarchyController GET]: ', error)
    //         throwHttpException(
    //             'An unexpected error occurred. Please try again later.',
    //             'Internal Server Error',
    //             HttpStatus.INTERNAL_SERVER_ERROR,
    //         )
    //     }
    // }
    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async delete(
        @Param('id') id: string,
        @Req() req: IAuthCustomRequest,
    ): Promise<HttpResponse<string>> {
        try {
            this.logger.log(
                'Route:[delete], Message: [Deleting access hierarchy]',
            )
            await this.accessHierarchyService.delete(id, req.authToken)
            return ok('Access deleted successfully')
        } catch (error) {
            this.logger.error(`[AccessHierarchyController DELETE]: ${error}`)
            throwHttpException(
                'An unexpected error occurred. Please try again later.',
                'Internal Server Error',
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }

    @Get('access-permissions/:id')
    @HttpCode(HttpStatus.OK)
    async getPermissionByAccessHierarchyId(
        @Param('id') id: number | string,
    ): Promise<HttpResponse<FiltersSelectAccessHierarchyPermissionResponse[]>> {
        try {
            this.logger.log(
                'Route:[access-permissions], Message: [Getting permissions by access hierarchy ID]',
            )
            const result =
                await this.accessHierarchyService.selectPermissionByAccessHierarchyId(
                    id,
                )
            if (!result) {
                throw new NotFoundException('Access Permissions not found')
            }
            return ok(result)
        } catch (error) {
            this.logger.error(
                `[AccessHierarchyController GET PERMISSIONS]: ${error}`,
            )
            throwHttpException(
                'An unexpected error occurred. Please try again later.',
                'Internal Server Error',
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }
}
