export interface ILogSSOLoginRequest {
  userId: string
  email: string
  status: string
  headerData?: {
    ip?: string
    device?: string
    browser?: string
  }
}
