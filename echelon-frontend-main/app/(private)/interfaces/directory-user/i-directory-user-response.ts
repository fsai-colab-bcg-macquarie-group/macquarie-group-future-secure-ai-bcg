import { IDirectoryUser } from './i-directory-user'

export default interface IDirectoryUserResponse {
  statusCode: number
  data: IDirectoryUser[]
  success: boolean
}
