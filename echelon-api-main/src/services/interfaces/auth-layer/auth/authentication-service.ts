import { User } from '@supabase/supabase-js'
import { AuthenticationUserRequest } from 'src/domain/auth-layer/auth/request/authentication-user-request'

export interface IAuthenticationService {
    authenticate(authenticationUser: AuthenticationUserRequest): Promise<{
        accessToken: string
        refreshToken: string
        user: User
    }>

    verifyEmail(email: string): Promise<{ message: string }>

    authenticateWithMagicLink(email: string): Promise<void>

    refreshToken(refreshToken: string): Promise<{
        accessToken: string
        refreshToken: string
    }>

    resetPassword(email: string): Promise<void>
}
