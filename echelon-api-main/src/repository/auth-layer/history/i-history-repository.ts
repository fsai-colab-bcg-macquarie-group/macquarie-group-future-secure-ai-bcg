import { HistoryType } from 'src/services/auth-layer/history/type-history'
export interface IHistoryRepository {
    saveHistory(data: HistoryType): Promise<any>
}
