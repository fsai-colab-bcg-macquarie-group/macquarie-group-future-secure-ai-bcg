import { IAuthCustomRequest } from 'src/controllers/http-helpers'
import { HttpResponse } from 'src/controllers/http-helpers/http-response'

export abstract class DataManagerController<
    TAddRequest,
    TAddResponse,
    TUpdateRequest,
    TUpdateResponse,
    TSelectResponse,
    TRequestFilters,
    TResponseAll,
> {
    protected name: string

    constructor(name: string) {
        this.name = name
    }

    abstract post(
        data: TAddRequest,
        req: IAuthCustomRequest,
    ): Promise<HttpResponse<TAddResponse>>

    abstract put(
        data: TUpdateRequest,
        req: IAuthCustomRequest,
    ): Promise<HttpResponse<TUpdateResponse>>

    abstract getAll(
        entity: TRequestFilters,
    ): Promise<HttpResponse<TResponseAll[] | null>>

    abstract get(
        id: string,
        req: IAuthCustomRequest,
    ): Promise<HttpResponse<TSelectResponse>>

    abstract delete(
        id: string | number,
        req: IAuthCustomRequest,
    ): Promise<HttpResponse<string>>
}
