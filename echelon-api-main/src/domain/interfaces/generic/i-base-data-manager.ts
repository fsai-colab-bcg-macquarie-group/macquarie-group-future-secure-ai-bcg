export interface IDataManagerService<
    TAddRequest,
    TAddResponse,
    TUpdateRequest,
    TUpdateResponse,
    TSelectResponse,
    TRequestFilters,
    TResponseAll,
> {
    add(entity: TAddRequest, database: string): Promise<TAddResponse | null>
    update(
        entity: TUpdateRequest,
        database: string,
    ): Promise<TUpdateResponse | null>
    delete(id: number | string, database: string): Promise<void>
    select(
        id: number | string,
        database: string,
    ): Promise<TSelectResponse | null>
    selectAll(
        entity: TRequestFilters,
        database: string,
    ): Promise<TResponseAll[] | null>
}
