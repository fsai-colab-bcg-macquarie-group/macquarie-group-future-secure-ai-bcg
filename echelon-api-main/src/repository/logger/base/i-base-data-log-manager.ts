export interface IBaseDataLogManager<TAddRequest> {
    saveLog(data: TAddRequest, database: string): Promise<void>
}
