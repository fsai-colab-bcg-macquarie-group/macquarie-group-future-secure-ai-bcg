import { BaseDataLogManager } from '../../base/base-data-log-manager'
import { ILogAuthenticationRepository } from './i-log-authentication-repository'
import { ILogLoginUserData } from './i-log-login-data'

export class LogAuthenticationRepository
    extends BaseDataLogManager<ILogLoginUserData>
    implements ILogAuthenticationRepository {}
