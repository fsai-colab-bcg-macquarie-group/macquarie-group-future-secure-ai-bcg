import { GetDirectoryUserResponse } from 'src/domain/auth-layer/directory-user/response/get-directory-user-response'

export default interface IDirectoryUserService {
    getUserList(textFilter?: string): Promise<GetDirectoryUserResponse[] | null>
    getUserByEmail(email: string): Promise<GetDirectoryUserResponse | null>
}
