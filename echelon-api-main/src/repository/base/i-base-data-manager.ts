export interface IBaseDataManager<
    TAddRequest,
    TPersistenceResponseAdd,
    TUpdateUserRequest,
    TPersistenceResponseUpdate,
    TPersistenceResponseSelect,
    TFiltersSelectAllRequest,
    TFiltersSelectAllResponse,
> {
    add(
        entity: TAddRequest,
        database: string,
    ): Promise<TPersistenceResponseAdd | null>

    update(
        entity: TUpdateUserRequest,
        database: string,
    ): Promise<TPersistenceResponseUpdate>

    delete(id: number, database: string): Promise<void>

    select(id: number, database: string): Promise<TPersistenceResponseSelect>

    selectAll(
        entity: TFiltersSelectAllRequest,
        database: string,
    ): Promise<TFiltersSelectAllResponse[]>
}
