import { HistoryType } from './type-history'

export interface IHistoryService {
    createHistory(data: HistoryType): Promise<any>
}
