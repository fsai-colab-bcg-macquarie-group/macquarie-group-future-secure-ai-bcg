import { Inject, NotFoundException } from '@nestjs/common'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { env } from 'src/config/env'
import { ILoggerService } from 'src/shared/services/interfaces/i-logger-service'
import { throwHttpException } from 'src/utils'
import { IBaseDataManager } from './i-base-data-manager'
import { LoggerService } from 'src/logger/logger.service'

export class BaseDataManager<
    TAddRequest,
    TPersistenceResponseAdd,
    TUpdateRequest,
    TPersistenceResponseUpdate,
    TPersistenceResponseSelect,
    TFiltersSelectAllRequest,
    TFiltersSelectAllResponse,
> implements
        IBaseDataManager<
            TAddRequest,
            TPersistenceResponseAdd,
            TUpdateRequest,
            TPersistenceResponseUpdate,
            TPersistenceResponseSelect,
            TFiltersSelectAllRequest,
            TFiltersSelectAllResponse
        >
{
    readonly supabase: SupabaseClient
    readonly supabaseUrl: string
    readonly supabaseClient: string
    constructor(
        readonly logger: LoggerService,
        @Inject('TOKEN_VALUE')
        readonly token: string,
    ) {
        ;(this.supabaseUrl = env.SUPABASE_URL || ''),
            (this.supabaseClient = env.SUPABASE_SERVICE_ROLE_KEY || ''),
            (this.supabase = createClient(
                this.supabaseUrl,
                this.supabaseClient,
            ))
    }

    createAuthenticatedClient(token: string): SupabaseClient {
        return createClient(this.supabaseUrl, this.supabaseClient, {
            global: {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        })
    }

    async add(
        entity: TAddRequest,
        database: string,
    ): Promise<TPersistenceResponseAdd | null> {
        this.logger.log(`Creating entity: ${JSON.stringify(entity)}`)
        const supabase = this.createAuthenticatedClient(this.token)
        const { data, error } = await supabase
            .schema('auth_layer')
            .from(database)
            .insert(entity)
            .select('*')
        if (error) {
            throwHttpException(error.message, error.code)
        }
        return data[0]
    }

    async update(
        entity: TUpdateRequest & { id: number | string },
        database: string,
    ): Promise<TPersistenceResponseUpdate> {
        this.logger.log(`Updating entity: ${JSON.stringify(entity)}`)
        const supabase = this.createAuthenticatedClient(this.token)
        const { data, error } = await supabase
            .schema('auth_layer')
            .from(database)
            .update(entity)
            .eq('id', entity['id'])
            .select('*')
        if (error) {
            throwHttpException(error.message, error.code)
        }

        if (!data || data.length === 0) {
            throw new NotFoundException('The resource was not found.')
        }
        return data[0]
    }

    async delete(id: number | string, database: string): Promise<void> {
        this.logger.log(`Deleting entity with ID: ${id}`)
        const { data, error } = await this.supabase
            .schema('auth_layer')
            .from(database)
            .delete()
            .match({ id })
            .select('*')

        if (error) {
            throwHttpException(error.message, error.code)
        }

        if (!data || data.length === 0) {
            throw new NotFoundException('The resource was not found.')
        }
    }

    async select(
        id: number | string,
        database: string,
    ): Promise<TPersistenceResponseSelect> {
        this.logger.log(`Select entity with ID: ${id}`)
        const supabase = this.createAuthenticatedClient(this.token)
        const { data, error } = await supabase
            .schema('auth_layer')
            .from(database)
            .select()
            .match({ id })

        if (error) {
            throwHttpException(error.message, error.code)
        }

        if (!data || data.length === 0) {
            throw new NotFoundException('The requested resource was not found.')
        }
        return data[0]
    }

    async selectAll(
        entity: TFiltersSelectAllRequest,
        database: string,
    ): Promise<TFiltersSelectAllResponse[]> {
        this.logger.log(
            `Select all entity with filters: ${JSON.stringify(entity)}`,
        )

        const supabase = this.createAuthenticatedClient(this.token)
        const { data, error } = await supabase
            .schema('auth_layer')
            .from(database)
            .select()
            .order('id', { ascending: true })
        if (error) {
            throwHttpException(error.message, error.code)
        }
        return data
    }

    async selectJoin(
        entity: TFiltersSelectAllRequest & {
            id: number | string
            tableJoin: string
            tableWhere: string
        },
        database: string,
    ): Promise<TFiltersSelectAllResponse[]> {
        this.logger.log(
            `Select all entity with filters: ${JSON.stringify(entity)}`,
        )
        const { data, error } = await this.supabase
            .schema('auth_layer')
            .from(database)
            .select(`${entity['tableJoin']} ( * )`)
            .eq(`${entity['tableWhere']}_id}`, entity['id'])
            .order('id', { ascending: true })
            .returns<TFiltersSelectAllResponse[]>()
        if (error)
            if (error) {
                throwHttpException(error.message, error.code)
            }
        return data
    }
}
