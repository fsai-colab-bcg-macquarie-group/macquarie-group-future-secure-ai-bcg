export interface ILoginCredentials {
  email: string
  password: string
  headerData?: {
    ip?: string
    device?: string
    browser?: string
  }
}
