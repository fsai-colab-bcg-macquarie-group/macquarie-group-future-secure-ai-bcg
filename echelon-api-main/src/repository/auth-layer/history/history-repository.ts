import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { env } from 'src/config/env'
import { IHistoryRepository } from './i-history-repository'
import { HistoryType } from 'src/services/auth-layer/history/type-history'
@Injectable()
export class HistoryRepository implements IHistoryRepository {
    private supabase: SupabaseClient

    constructor() {
        this.supabase = createClient(
            env.SUPABASE_URL || '',
            env.SUPABASE_SERVICE_ROLE_KEY || '',
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false,
                },
            },
        )
    }

    async saveHistory(body: HistoryType): Promise<any> {
        const { data, error } = await this.supabase
            .schema('audit_log')
            .from('history')
            .insert(body)

        if (error) {
            throw new InternalServerErrorException(
                'Database connection failed.',
            )
        }
        return data
    }
}
