import { Inject, Injectable } from '@nestjs/common'
import { HistoryRepository } from 'src/repository/auth-layer/history/history-repository'
import { IHistoryService } from './i-history-service'
import { HistoryType } from './type-history'
@Injectable()
export class HistoryService implements IHistoryService {
    constructor(
        @Inject('IHistoryRepository')
        private readonly historyRepository: HistoryRepository,
    ) {}

    async createHistory(data: HistoryType): Promise<any> {
        return this.historyRepository.saveHistory(data)
    }
}
