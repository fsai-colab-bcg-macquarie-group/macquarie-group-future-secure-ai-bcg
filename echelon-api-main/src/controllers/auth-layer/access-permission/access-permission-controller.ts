import {
    Body,
    Controller,
    Delete,
    Get,
    HttpStatus,
    Inject,
    Param,
    Post,
    Put,
    UseGuards,
} from '@nestjs/common'
import { HttpResponse, ok } from 'src/controllers/http-helpers/http-response'
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
import { IAccessHierarchyPermissionService } from 'src/domain/interfaces/services/auth-layer/access-permission/i-access-permission-service'
import { AuthGuard } from 'src/middleware/auth-guard'
import { DataManagerController } from '../generic/data-manager-controller'
import { throwHttpException } from 'src/utils'
import { LoggerService } from 'src/logger/logger.service'

@UseGuards(AuthGuard)
@Controller('access-permission')
export class AccessHierarchyPermissionController extends DataManagerController<
    AddAccessHierarchyPermissionRequest,
    AddAccessHierarchyPermissionResponse,
    UptadeAccessHierarchyPermissionRequest,
    UptadeAccessHierarchyPermissionResponse,
    FilterSelectAccessHierarchyPermissionResponse,
    FiltersSelectAllAccessHierarchyPermissionRequest,
    FiltersSelectAccessHierarchyPermissionResponse
> {
    constructor(
        @Inject('IAccessHierarchyPermissionService')
        private readonly accessHierarchyPermissionService: IAccessHierarchyPermissionService,
        private readonly logger: LoggerService,
    ) {
        super('AccessHierarchy')
    }

    @Post()
    async post(
        @Body() data: AddAccessHierarchyPermissionRequest,
    ): Promise<HttpResponse<AddAccessHierarchyPermissionResponse>> {
        try {
            this.logger.log(
                'Route:[post], Message: [Creating new access hierarchy permission]',
            )
            const accessHierarchyPermissionCreated =
                await this.accessHierarchyPermissionService.add(data, '')
            if (!accessHierarchyPermissionCreated) {
                throwHttpException(
                    'AccessHierarchy permission not created',
                    HttpStatus.BAD_REQUEST,
                    HttpStatus.BAD_REQUEST,
                )
            }
            return ok(accessHierarchyPermissionCreated)
        } catch (error) {
            this.logger.error(
                `[AccessHierarchyPermissionController POST]: ${error}`,
            )
            throwHttpException(
                'An unexpected error occurred. Please try again later.',
                'Internal Server Error',
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }

    @Put()
    async put(
        @Body() data: UptadeAccessHierarchyPermissionRequest,
    ): Promise<HttpResponse<UptadeAccessHierarchyPermissionResponse>> {
        try {
            this.logger.log(
                'Route:[put], Message: [Updating access hierarchy permission]',
            )
            const accessHierarchyPermissionUpdated =
                await this.accessHierarchyPermissionService.update(data, '')
            if (!accessHierarchyPermissionUpdated) {
                throwHttpException(
                    'AccessHierarchy permission not updated',
                    HttpStatus.BAD_REQUEST,
                    HttpStatus.BAD_REQUEST,
                )
            }
            return ok(accessHierarchyPermissionUpdated)
        } catch (error) {
            this.logger.error(
                `[AccessHierarchyPermissionController PUT]: ${error}`,
            )
            throwHttpException(
                'An unexpected error occurred. Please try again later.',
                'Internal Server Error',
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }

    @Get()
    async getAll(
        entity: FiltersSelectAllAccessHierarchyPermissionRequest,
    ): Promise<
        HttpResponse<FiltersSelectAccessHierarchyPermissionResponse[] | null>
    > {
        try {
            this.logger.log(
                'Route:[getAll], Message: [Getting all access hierarchy permissions]',
            )
            const accessHierarchyPermissionsFound =
                await this.accessHierarchyPermissionService.selectAll(entity)
            return ok(accessHierarchyPermissionsFound)
        } catch (error) {
            this.logger.error(
                `[AccessHierarchyPermissionController GET]: ${error}`,
            )
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
            this.logger.log(
                'Route:[get], Message: [Getting access hierarchy permission by ID]',
            )
            const accessFound =
                await this.accessHierarchyPermissionService.select(id)
            return ok(accessFound)
        } catch (error) {
            this.logger.error(
                `[AccessHierarchyPermissionController GET]: ${error}`,
            )
            throwHttpException(
                'An unexpected error occurred. Please try again later.',
                'Internal Server Error',
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }

    @Delete(':id')
    async delete(@Param('id') id: number): Promise<HttpResponse<string>> {
        try {
            this.logger.log(
                'Route:[delete], Message: [Deleting access hierarchy permission]',
            )
            await this.accessHierarchyPermissionService.delete(id, '')
            return ok('AccessHierarchy permission deleted')
        } catch (error) {
            this.logger.error(
                `[AccessHierarchyPermissionController DELETE]: ${error}`,
            )
            throwHttpException(
                'An unexpected error occurred. Please try again later.',
                'Internal Server Error',
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }
    }
}
