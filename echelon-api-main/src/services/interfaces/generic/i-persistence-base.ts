export interface IPersistenceBase<
    TAddRequest,
    TAddResponse,
    TUpdateRequest,
    TUpdateResponse,
    TSelectRequest extends { id: string | number; token?: string },
    TSelectResponse,
    TRequestFilters,
    TResponseAll,
> {
    add(entity: TAddRequest, token: string): Promise<TAddResponse | null>
    update(
        entity: TUpdateRequest,
        token: string,
    ): Promise<TUpdateResponse | null>
    delete(id: number | string, token: string): Promise<string | null>
    select({ id, token }: TSelectRequest): Promise<TSelectResponse | null>
    selectAll(entity: TRequestFilters): Promise<TResponseAll[] | null>
}
