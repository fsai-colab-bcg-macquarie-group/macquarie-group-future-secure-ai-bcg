import { Request } from 'express'
export interface IAuthCustomRequest extends Request {
    user: {
        email: string
        profile: IUserProfile
        session_id: string
        user_id: string
        user_permissions: []
        access_id: string
    }
    authToken: string
}

interface IUserProfile {
    first_name: string
    last_name: string
    access_id: string
    access_name: string
}
