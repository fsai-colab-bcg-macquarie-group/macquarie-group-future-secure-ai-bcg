import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { env } from 'process'
import { IBaseDataLogManager } from './i-base-data-log-manager'

@Injectable()
export class BaseDataLogManager<TAddRequest>
    implements IBaseDataLogManager<TAddRequest>
{
    private supabase: SupabaseClient
    private options = {
        realtime: {
            params: {
                log_level: 'info',
            },
        },
    }
    constructor() {
        this.supabase = createClient(
            env.SUPABASE_URL || '',
            env.SUPABASE_SERVICE_ROLE_KEY || '',
            this.options,
        )
    }
    async saveLog(entity: TAddRequest, database: string): Promise<void> {
        const { data, error } = await this.supabase
            .schema('audit_log')
            .from(database)
            .insert(entity)
        if (error)
            throw new InternalServerErrorException(
                'Database connection failed.',
            )
    }
}
