import { LogStatusType } from 'src/repository/logger/auth-layer/auth/enum/log-status-type'

export interface ILogLoginUserData {
    user_id?: string | number | null
    username?: string
    email?: string | null
    ip?: string
    device?: string | null
    browser?: string | null
    status?: LogStatusType
    session_id?: string | null
    failure_reason?: string | null
    created_at?: Date
}

export interface IHeaderMetadata {
    ip: string
    device: string
    browser: string
}
