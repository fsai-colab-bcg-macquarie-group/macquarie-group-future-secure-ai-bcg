import { ILogLoginUserData } from 'src/repository/logger/auth-layer/auth/i-log-login-data'

export interface ILogAuthenticationService {
    saveLoginUserSuccess(data: ILogLoginUserData): Promise<void>
    saveLoginUserFailure(data: ILogLoginUserData): Promise<void>
}
