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
} from '@nestjs/common'
import {
    AddWorkerRequest,
    UpdateWorkerRequest,
    FiltersSelectAllWorkerRequest,
} from 'src/domain/head-agent/request'
import {
    AddWorkerResponse,
    UpdateWorkerResponse,
    FilterSelectWorkerResponse,
    FiltersSelectAllWorkerResponse,
} from 'src/domain/head-agent/response'
import { IWorkerService } from 'src/services/interfaces/head-agent/i-worker-service'
import { DataManagerController } from '../auth-layer/generic/data-manager-controller'
import { HttpResponse, ok } from '../http-helpers/http-response'
import { throwHttpException } from 'src/utils'

@Controller('workers')
export class WorkerController extends DataManagerController<
    AddWorkerRequest,
    AddWorkerResponse,
    UpdateWorkerRequest,
    UpdateWorkerResponse,
    FilterSelectWorkerResponse,
    FiltersSelectAllWorkerRequest,
    FiltersSelectAllWorkerResponse
> {
    constructor(
        @Inject('IWorkerService')
        private readonly workService: IWorkerService,
    ) {
        super('Worker')
    }

    @Post()
    async post(
        @Body() data: AddWorkerRequest,
    ): Promise<HttpResponse<AddWorkerResponse>> {
        const result = await this.workService.add(data, '')
        if (!result) {
            throwHttpException(
                'Worker not created',
                HttpStatus.BAD_REQUEST,
                HttpStatus.BAD_REQUEST,
            )
        }
        return ok(result)
    }

    @Put()
    async put(
        @Body() data: UpdateWorkerRequest,
    ): Promise<HttpResponse<UpdateWorkerResponse>> {
        const result = await this.workService.update(data, '')
        if (!result) {
            throwHttpException(
                'Worker not updated',
                HttpStatus.BAD_REQUEST,
                HttpStatus.BAD_REQUEST,
            )
        }
        return ok(result)
    }

    @Get()
    async getAll(
        @Body() entity: FiltersSelectAllWorkerRequest,
    ): Promise<HttpResponse<FiltersSelectAllWorkerResponse[] | null>> {
        const result = await this.workService.selectAll(entity)
        return ok(result)
    }

    @Get(':id')
    async get(@Param('id') id: number | string): Promise<any> {
        const result = await this.workService.select(id)
        if (!result) {
            throw new NotFoundException('Worker not found')
        }
        return result
    }

    @Delete(':id')
    async delete(
        @Param('id') id: number | string,
    ): Promise<HttpResponse<string>> {
        await this.workService.delete(id, '')
        throw new Error(`Method not implemented. Id: ${id}`)
    }
}
