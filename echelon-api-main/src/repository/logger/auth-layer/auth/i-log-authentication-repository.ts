import { IBaseDataLogManager } from '../../base/i-base-data-log-manager'
import { ILogLoginUserData } from './i-log-login-data'

export interface ILogAuthenticationRepository
    extends IBaseDataLogManager<ILogLoginUserData> {}
